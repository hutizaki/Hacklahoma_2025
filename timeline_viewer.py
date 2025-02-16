# timeline_replay.py
import sys, json, os, re
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QVBoxLayout, QSlider, QTextEdit, QLabel, QFileDialog, QPushButton, QHBoxLayout
)
from PyQt5.QtCore import Qt

def parse_logs(logs):
    """
    Given a list of log strings, parse each one to extract the inserted text.
    Returns a list of events: each event is a dict with keys:
      - timestamp: string
      - text: the inserted text (if deletion, text is an empty string)
    """
    events = []
    pattern = re.compile(r'\[(.*?)\].*Inserted:\s*"([^"]*)"')
    for log in logs:
        m = pattern.search(log)
        if m:
            timestamp, inserted = m.groups()
            events.append({
                "timestamp": timestamp,
                "inserted": inserted
            })
    return events

def build_states(events):
    """
    Replays the events to build a list of text states.
    For each event in order:
      - If inserted text is non-empty, append it.
      - If inserted text is empty, assume deletion: remove one character from the end.
    Returns a list of states, where state[i] is the text after events[0..i] have been applied.
    """
    states = []
    current_text = ""
    for event in events:
        ins = event["inserted"]
        if ins == "":
            # treat empty insertion as deletion of one character, if possible
            current_text = current_text[:-1] if current_text else ""
        else:
            current_text += ins
        states.append(current_text)
    return states

class TimelineReplayer(QMainWindow):
    def __init__(self, report_file):
        super().__init__()
        self.setWindowTitle("Typing Replay Timeline")
        self.report_file = report_file
        self.logs = []
        self.events = []
        self.states = []
        self.load_report()
        self.initUI()

    def load_report(self):
        if os.path.exists(self.report_file):
            try:
                with open(self.report_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.logs = data.get("logs", [])
            except Exception as e:
                print("Error loading report:", e)
                self.logs = []
        else:
            print(f"Report file {self.report_file} not found.")
            self.logs = []
        self.events = parse_logs(self.logs)
        self.states = build_states(self.events)

    def initUI(self):
        centralWidget = QWidget()
        self.setCentralWidget(centralWidget)
        mainLayout = QVBoxLayout()
        centralWidget.setLayout(mainLayout)

        # Button to load a different report file
        loadButton = QPushButton("Load Report")
        loadButton.clicked.connect(self.choose_report_file)
        mainLayout.addWidget(loadButton)

        self.infoLabel = QLabel("Drag the slider to replay the typing session:")
        mainLayout.addWidget(self.infoLabel)

        # Timeline slider: its range is based on the number of events
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
        mainLayout.addWidget(self.slider)

        # A text area to display the current replay state (what was typed so far)
        self.textEdit = QTextEdit()
        self.textEdit.setReadOnly(True)
        mainLayout.addWidget(self.textEdit)

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
            self.load_report()
            if self.states:
                self.slider.setMaximum(len(self.states) - 1)
                self.slider.setValue(0)
                self.update_text(0)
            else:
                self.textEdit.setText("No events found in report.")

    def update_text(self, value):
        if 0 <= value < len(self.states):
            # Display the state as the replayed text so far.
            self.textEdit.setText(self.states[value])
        else:
            self.textEdit.setText("")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    # Default report file path (adjust as needed)
    report_file_path = os.path.join(os.getcwd(), "hello_report.json")
    window = TimelineReplayer(report_file_path)
    window.resize(800, 600)
    window.show()
    sys.exit(app.exec_())
