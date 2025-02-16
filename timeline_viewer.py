# timeline_replay.py
import sys, json, os, re, glob, copy, datetime
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QSlider, QTextEdit, QLabel, QFileDialog, QPushButton
)
from PyQt5.QtCore import Qt

def load_combined_events(selected_report_file):
    """
    Load all report files for the same base document (e.g. hello_report*.json) from the same folder,
    combine their logs, sort them by timestamp, and filter to keep only the first INITIAL event.
    """
    directory = os.path.dirname(selected_report_file)
    base_report_pattern = re.compile(r'^(.*)_report(\d+)\.json$')
    selected_file_name = os.path.basename(selected_report_file)
    m = base_report_pattern.match(selected_file_name)
    if not m:
        print("Selected file doesn't match expected pattern.")
        return []
    base_name = m.group(1)
    pattern = os.path.join(directory, f"{base_name}_report*.json")
    all_files = glob.glob(pattern)
    combined_events = []
    for file in all_files:
        try:
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
                logs = data.get("logs", [])
                combined_events.extend(logs)
        except Exception as e:
            print(f"Error loading {file}: {e}")
    try:
        combined_events.sort(key=lambda e: datetime.datetime.fromisoformat(e.get("timestamp", "1970-01-01T00:00:00")))
    except Exception as e:
        print("Error sorting events by timestamp:", e)
    # Keep only the first INITIAL event.
    filtered = []
    initial_found = False
    for event in combined_events:
        if event.get("event") == "INITIAL":
            if not initial_found:
                filtered.append(event)
                initial_found = True
        else:
            filtered.append(event)
    return filtered

def load_initial_state(report_file):
    """
    Load the initial state from the INITIAL event in the report.
    If not found, try loading the corresponding text file (e.g. hello.txt).
    Returns a list of lines.
    """
    directory = os.path.dirname(report_file)
    base_report_pattern = re.compile(r'^(.*)_report\d+\.json$')
    base_name = os.path.basename(report_file)
    m = base_report_pattern.match(base_name)
    if m:
        pattern = os.path.join(directory, f"{m.group(1)}_report*.json")
        all_files = glob.glob(pattern)
        all_events = []
        for file in all_files:
            try:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    logs = data.get("logs", [])
                    all_events.extend(logs)
            except Exception as e:
                print(f"Error loading {file}: {e}")
        all_events.sort(key=lambda e: datetime.datetime.fromisoformat(e.get("timestamp", "1970-01-01T00:00:00")))
        # Choose the first INITIAL event that has structured initialContent.
        for event in all_events:
            if event.get("event") == "INITIAL" and event.get("initialContent"):
                # Build initial state from structured content.
                return [lineObj["content"] for lineObj in event["initialContent"]]
        # Fallback: try to load the corresponding text file.
        docName = m.group(1) + ".txt"
        docPath = os.path.join(directory, docName)
        if os.path.exists(docPath):
            with open(docPath, "r", encoding="utf-8") as f:
                content = f.read()
                return content.splitlines()
    return [""]

def parse_range(range_str):
    """
    Parse a range string formatted as "startLine:startCol-endLine:endCol" and return integers.
    """
    try:
        start_part, end_part = range_str.split('-')
        start_line, start_col = map(int, start_part.split(':'))
        end_line, end_col = map(int, end_part.split(':'))
        return start_line, start_col, end_line, end_col
    except Exception as e:
        print("Error parsing range:", range_str, e)
        return 0, 0, 0, 0

def apply_event(state_lines, event):
    """
    Apply a single event to the current multi-line state.
    Handles INSERTION, DELETION, and OVERWRITE events with multi-line support.
    """
    etype = event.get("event")
    if etype == "INITIAL":
        return copy.deepcopy(event.get("initialContent", []))
    if "range" not in event:
        return state_lines
    start_line, start_col, end_line, end_col = parse_range(event["range"])
    # Ensure state_lines is long enough.
    while len(state_lines) <= max(start_line, end_line):
        state_lines.append("")
    if etype == "INSERTION":
        inserted = event.get("inserted", "")
        # If the inserted text has newlines, split it.
        if "\n" in inserted or "\r" in inserted:
            inserted_lines = inserted.splitlines()
            # If inserted text ends with newline, add an empty string.
            if inserted.endswith("\n") or inserted.endswith("\r"):
                inserted_lines.append("")
            # Insert into the first line.
            first_line = state_lines[start_line]
            new_first = first_line[:start_col] + inserted_lines[0]
            # Last line: inserted_lines[-1] plus remainder of original line.
            new_last = inserted_lines[-1] + first_line[start_col:]
            new_lines = [new_first] + inserted_lines[1:-1] + [new_last]
            # Replace current line with new_lines[0] and insert subsequent lines.
            state_lines[start_line] = new_lines[0]
            for i, line in enumerate(new_lines[1:], start=start_line+1):
                state_lines.insert(i, line)
        else:
            line = state_lines[start_line]
            new_line = line[:start_col] + inserted + line[start_col:]
            state_lines[start_line] = new_line
    elif etype == "DELETION":
        if start_line == end_line:
            line = state_lines[start_line]
            new_line = line[:start_col] + line[end_col:]
            state_lines[start_line] = new_line
        else:
            first_part = state_lines[start_line][:start_col]
            last_part = state_lines[end_line][end_col:]
            state_lines[start_line] = first_part + last_part
            for _ in range(end_line - start_line):
                del state_lines[start_line+1]
    elif etype == "OVERWRITE":
        inserted = event.get("inserted", "")
        if "\n" in inserted or "\r" in inserted:
            inserted_lines = inserted.splitlines()
            if inserted.endswith("\n") or inserted.endswith("\r"):
                inserted_lines.append("")
            if start_line == end_line:
                line = state_lines[start_line]
                new_line = line[:start_col] + inserted + line[end_col:]
                state_lines[start_line] = new_line
            else:
                first_part = state_lines[start_line][:start_col]
                last_part = state_lines[end_line][end_col:]
                new_first = first_part + inserted_lines[0]
                new_last = inserted_lines[-1] + last_part
                new_lines = [new_first] + inserted_lines[1:-1] + [new_last]
                state_lines[start_line] = new_lines[0]
                for i, line in enumerate(new_lines[1:], start=start_line+1):
                    state_lines.insert(i, line)
                for _ in range(end_line - start_line):
                    del state_lines[start_line+len(new_lines)]
        else:
            if start_line == end_line:
                line = state_lines[start_line]
                new_line = line[:start_col] + inserted + line[end_col:]
                state_lines[start_line] = new_line
            else:
                first_part = state_lines[start_line][:start_col] + inserted + state_lines[end_line][end_col:]
                state_lines[start_line] = first_part
                for _ in range(end_line - start_line):
                    del state_lines[start_line+1]
    return state_lines

def build_states(initial_state, events):
    """
    Build a list of document states by applying events sequentially.
    Each state is represented as a list of lines.
    """
    state = copy.deepcopy(initial_state)
    states = [copy.deepcopy(state)]
    for event in events:
        etype = event.get("event")
        if etype in ["INSERTION", "DELETION", "OVERWRITE"]:
            state = apply_event(state, event)
        states.append(copy.deepcopy(state))
    return states

def format_state(state_lines):
    """
    Format a state (list of lines) with line numbers.
    """
    formatted = []
    for idx, line in enumerate(state_lines, start=1):
        formatted.append(f"{idx:3d}: {line}")
    return "\n".join(formatted)

class TimelineReplayer(QMainWindow):
    def __init__(self, report_file):
        super().__init__()
        self.setWindowTitle("Typing Replay Timeline")
        self.report_file = report_file
        self.initial_state = load_initial_state(report_file)
        self.events = load_combined_events(report_file)
        if not self.events or self.events[0].get("event") != "INITIAL":
            initial_event = {
                "timestamp": "1970-01-01T00:00:00",
                "event": "INITIAL",
                "initialContent": self.initial_state
            }
            self.events.insert(0, initial_event)
        self.states = build_states(self.initial_state, self.events)
        self.initUI()

    def initUI(self):
        centralWidget = QWidget()
        self.setCentralWidget(centralWidget)
        layout = QVBoxLayout()
        centralWidget.setLayout(layout)

        loadButton = QPushButton("Load Report")
        loadButton.clicked.connect(self.choose_report_file)
        layout.addWidget(loadButton)

        self.infoLabel = QLabel("Drag the slider to replay the typing session:")
        layout.addWidget(self.infoLabel)

        self.slider = QSlider(Qt.Horizontal)
        if self.states:
            self.slider.setMinimum(0)
            self.slider.setMaximum(len(self.states) - 1)
        else:
            self.slider.setMinimum(0)
            self.slider.setMaximum(0)
        self.slider.setTickPosition(QSlider.TicksBelow)
        self.slider.setTickInterval(1)
        self.slider.valueChanged.connect(self.update_text)
        layout.addWidget(self.slider)

        self.textEdit = QTextEdit()
        self.textEdit.setReadOnly(True)
        layout.addWidget(self.textEdit)

        if self.states:
            self.slider.setValue(0)
            self.update_text(0)
        else:
            self.textEdit.setText("No events found in report.")

    def choose_report_file(self):
        options = QFileDialog.Options()
        options |= QFileDialog.ReadOnly
        fileName, _ = QFileDialog.getOpenFileName(self, "Select Report JSON", "",
                                                  "JSON Files (*.json);;All Files (*)", options=options)
        if fileName:
            self.report_file = fileName
            self.initial_state = load_initial_state(self.report_file)
            self.events = load_combined_events(self.report_file)
            if not self.events or self.events[0].get("event") != "INITIAL":
                initial_event = {
                    "timestamp": "1970-01-01T00:00:00",
                    "event": "INITIAL",
                    "initialContent": self.initial_state
                }
                self.events.insert(0, initial_event)
            self.states = build_states(self.initial_state, self.events)
            if self.states:
                self.slider.setMaximum(len(self.states) - 1)
                self.slider.setValue(0)
                self.update_text(0)
            else:
                self.textEdit.setText("No events found in report.")

    def update_text(self, value):
        if 0 <= value < len(self.states):
            formatted = format_state(self.states[value])
            self.textEdit.setText(formatted)
        else:
            self.textEdit.setText("")

if __name__ == '__main__':
    import copy
    app = QApplication(sys.argv)
    report_file_path = os.path.join(os.getcwd(), "hello_report1.json")
    window = TimelineReplayer(report_file_path)
    window.resize(800, 600)
    window.show()
    sys.exit(app.exec_())