# timeline_replay.py
import sys, json, os, copy, datetime
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QSlider, QTextEdit, QLabel, QFileDialog, QPushButton
)
from PyQt5.QtCore import Qt

def load_combined_events(selected_report_file):
    """
    Load events from the selected report file.
    Sort them by timestamp and filter to keep only the first INITIAL event.
    """
    try:
        with open(selected_report_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            events = data.get("logs", [])
        events.sort(key=lambda e: datetime.datetime.fromisoformat(e.get("timestamp", "1970-01-01T00:00:00")))
        # Keep only the first INITIAL event.
        filtered = []
        initial_found = False
        for event in events:
            if event.get("event") == "INITIAL":
                if not initial_found:
                    filtered.append(event)
                    initial_found = True
            else:
                filtered.append(event)
        return filtered
    except Exception as e:
        print("Error loading selected report file:", e)
        return []

def load_initial_state(report_file):
    """
    Load the initial state from the INITIAL event in the report file.
    If not found, try loading the corresponding text file (i.e. the file without the .json extension).
    Returns a list of lines.
    """
    try:
        with open(report_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            logs = data.get("logs", [])
        logs.sort(key=lambda e: datetime.datetime.fromisoformat(e.get("timestamp", "1970-01-01T00:00:00")))
        for event in logs:
            if event.get("event") == "INITIAL" and event.get("initialContent"):
                return [lineObj["content"] for lineObj in event["initialContent"]]
        # Fallback: try to load the corresponding text file (remove the .json extension).
        base, _ = os.path.splitext(report_file)
        if os.path.exists(base):
            with open(base, "r", encoding="utf-8") as f:
                content = f.read()
                return content.splitlines()
    except Exception as e:
        print("Error loading initial state from report file:", e)
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
    Handles multi-line insertions, deletions, and overwrites.
    """
    etype = event.get("event")
    if etype == "INITIAL":
        return copy.deepcopy(event.get("initialContent", []))
    if "range" not in event:
        return state_lines
    start_line, start_col, end_line, end_col = parse_range(event["range"])
    while len(state_lines) <= max(start_line, end_line):
        state_lines.append("")
    if etype == "INSERTION":
        inserted = event.get("inserted", "")
        if "\n" in inserted or "\r" in inserted:
            inserted_lines = inserted.splitlines()
            if inserted.endswith("\n") or inserted.endswith("\r"):
                inserted_lines.append("")
            first_line = state_lines[start_line]
            new_first = first_line[:start_col] + inserted_lines[0]
            new_last = inserted_lines[-1] + first_line[start_col:]
            new_lines = [new_first] + inserted_lines[1:-1] + [new_last]
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
                first_part = state_lines[start_line][:start_col] + inserted_lines[0]
                last_part = inserted_lines[-1] + state_lines[end_line][end_col:]
                new_lines = [first_part] + inserted_lines[1:-1] + [last_part]
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
    app = QApplication(sys.argv)
    fileName, _ = QFileDialog.getOpenFileName(None, "Select Report JSON", os.getcwd(),
                                              "JSON Files (*.json);;All Files (*)")
    if not fileName:
        sys.exit(0)
    window = TimelineReplayer(fileName)
    window.resize(800, 600)
    window.show()
    sys.exit(app.exec_())