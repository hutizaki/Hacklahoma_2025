# timeline_replay.py
import sys, json, os
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QSlider, QTextEdit, QLabel, QFileDialog, QPushButton
)
from PyQt5.QtCore import Qt

def load_events(report_file):
    """Load structured log events from the JSON report file."""
    try:
        with open(report_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("logs", [])
    except Exception as e:
        print("Error loading report:", e)
        return []

def parse_range(range_str):
    """
    Parse a range string formatted as "start-end" and return (start, end) as integers.
    Assumes a single-line document.
    """
    try:
        start_str, end_str = range_str.split("-")
        return int(start_str), int(end_str)
    except Exception as e:
        print("Error parsing range:", range_str, e)
        return 0, 0

def apply_event(state, event):
    """
    Apply a single event to the current state and return the new state.
    For multi-line or more complex events, this logic would need to be extended.
    """
    etype = event.get("event")
    # Use range if available. Otherwise, default to position 0.
    if "range" in event:
        start, end = parse_range(event["range"])
    else:
        start, end = 0, 0

    if etype == "INSERTION":
        inserted = event.get("inserted", "")
        new_state = state[:start] + inserted + state[start:]
        return new_state
    elif etype == "DELETION":
        # Remove text from start to end.
        new_state = state[:start] + state[end:]
        return new_state
    elif etype == "OVERWRITE":
        inserted = event.get("inserted", "")
        new_state = state[:start] + inserted + state[end:]
        return new_state
    # For UNDO, REDO, CUT, or SELECTION events, we can decide to ignore them
    # for the purpose of text state reconstruction.
    else:
        return state

def build_states(events):
    """
    Build a list of text states by applying each event sequentially.
    We start with an empty string.
    Only events of type INSERTION, DELETION, or OVERWRITE modify the state.
    """
    state = ""
    states = [state]
    for event in events:
        etype = event.get("event")
        if etype in ["INSERTION", "DELETION", "OVERWRITE"]:
            state = apply_event(state, event)
        # SELECTION, UNDO, REDO, CUT events are ignored here.
        states.append(state)
    return states

class TimelineReplayer(QMainWindow):
    def __init__(self, report_file):
        super().__init__()
        self.setWindowTitle("Typing Replay Timeline")
        self.report_file = report_file
        self.events = load_events(self.report_file)
        self.states = build_states(self.events)
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
            self.events = load_events(self.report_file)
            self.states = build_states(self.events)
            if self.states:
                self.slider.setMaximum(len(self.states) - 1)
                self.slider.setValue(0)
                self.update_text(0)
            else:
                self.textEdit.setText("No events found in report.")

    def update_text(self, value):
        if 0 <= value < len(self.states):
            self.textEdit.setText(self.states[value])
        else:
            self.textEdit.setText("")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    report_file_path = os.path.join(os.getcwd(), "hello_report.json")
    window = TimelineReplayer(report_file_path)
    window.resize(800, 600)
    window.show()
    sys.exit(app.exec_())
