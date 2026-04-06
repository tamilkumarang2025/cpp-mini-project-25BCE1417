/*
===========================================
  Project Title: Smart Student Performance System – Mentor Dashboard
  Language: C++ (OOP Based)
  Description: Tracks student performance across CAT1, CAT2, FAT assessments.
               Computes totals, averages, grades, and generates reports.
===========================================
*/

#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <iomanip>
#include <algorithm>
#include <map>
using namespace std;

// ============================================================
//  CLASS: Student
//  Represents a single student with marks and computed results
// ============================================================
class Student {
private:
    string regNo;
    string name;
    float cat1, cat2, fat;
    float total;
    float average;
    string grade;

public:
    // Constructor
    Student(string r, string n, float c1, float c2, float f)
        : regNo(r), name(n), cat1(c1), cat2(c2), fat(f) {
        computeGrade();
    }

    // Default constructor (for file loading)
    Student() : cat1(0), cat2(0), fat(0), total(0), average(0), grade("N/A") {}

    // Compute total, average, and grade
    void computeGrade() {
        total   = cat1 + cat2 + fat;
        average = total / 3.0f;
        if (average >= 80)      grade = "A";
        else if (average >= 60) grade = "B";
        else if (average >= 40) grade = "C";
        else                    grade = "Fail";
    }

    // Display student record
    void display() const {
        cout << left
             << setw(14) << regNo
             << setw(20) << name
             << setw(7)  << cat1
             << setw(7)  << cat2
             << setw(7)  << fat
             << setw(8)  << total
             << setw(9)  << fixed << setprecision(2) << average
             << setw(6)  << grade
             << "\n";
    }

    // Getters
    string getRegNo()   const { return regNo; }
    string getName()    const { return name; }
    float  getCat1()    const { return cat1; }
    float  getCat2()    const { return cat2; }
    float  getFat()     const { return fat; }
    float  getTotal()   const { return total; }
    float  getAverage() const { return average; }
    string getGrade()   const { return grade; }

    // Setters (for update)
    void setCat1(float c) { cat1 = c; computeGrade(); }
    void setCat2(float c) { cat2 = c; computeGrade(); }
    void setFat(float f)  { fat  = f; computeGrade(); }
};


// ============================================================
//  CLASS: StudentManager
//  Manages the collection of students; handles file I/O
// ============================================================
class StudentManager {
private:
    vector<Student> students;
    const string FILENAME = "students.csv";

    // Validate mark range (0–100)
    bool isValidMark(float mark) {
        return (mark >= 0 && mark <= 100);
    }

    // Check for duplicate RegNo
    bool isDuplicate(const string& regNo) {
        for (const auto& s : students)
            if (s.getRegNo() == regNo) return true;
        return false;
    }

public:
    // Constructor — load from file on startup
    StudentManager() {
        loadFromFile();
    }

    // ---- SAVE all records to CSV file ----
    void saveToFile() {
        ofstream file(FILENAME);
        if (!file.is_open()) {
            cout << "[ERROR] Cannot open file for writing.\n";
            return;
        }
        for (const auto& s : students) {
            file << s.getRegNo() << ","
                 << s.getName()  << ","
                 << s.getCat1()  << ","
                 << s.getCat2()  << ","
                 << s.getFat()   << "\n";
        }
        file.close();
    }

    // ---- LOAD all records from CSV file ----
    void loadFromFile() {
        students.clear();
        ifstream file(FILENAME);
        if (!file.is_open()) return; // First run — no file yet

        string line;
        while (getline(file, line)) {
            if (line.empty()) continue;
            string regNo, name, c1s, c2s, fs;
            size_t p1 = line.find(',');
            size_t p2 = line.find(',', p1 + 1);
            size_t p3 = line.find(',', p2 + 1);
            size_t p4 = line.find(',', p3 + 1);

            if (p1 == string::npos || p2 == string::npos ||
                p3 == string::npos || p4 == string::npos) continue;

            regNo = line.substr(0, p1);
            name  = line.substr(p1 + 1, p2 - p1 - 1);
            c1s   = line.substr(p2 + 1, p3 - p2 - 1);
            c2s   = line.substr(p3 + 1, p4 - p3 - 1);
            fs    = line.substr(p4 + 1);

            try {
                Student s(regNo, name, stof(c1s), stof(c2s), stof(fs));
                students.push_back(s);
            } catch (...) {
                cout << "[WARN] Skipped corrupt record.\n";
            }
        }
        file.close();
    }

    // ---- ADD a new student ----
    void addStudent() {
        string regNo, name;
        float c1, c2, f;

        cout << "\n--- Add New Student ---\n";
        cout << "Enter RegNo: ";
        cin >> regNo;

        if (isDuplicate(regNo)) {
            cout << "[ERROR] RegNo " << regNo << " already exists.\n";
            return;
        }

        cin.ignore();
        cout << "Enter Name : ";
        getline(cin, name);

        cout << "Enter CAT1 marks (0-100): ";
        cin >> c1;
        if (!isValidMark(c1)) { cout << "[ERROR] Invalid CAT1 marks.\n"; return; }

        cout << "Enter CAT2 marks (0-100): ";
        cin >> c2;
        if (!isValidMark(c2)) { cout << "[ERROR] Invalid CAT2 marks.\n"; return; }

        cout << "Enter FAT  marks (0-100): ";
        cin >> f;
        if (!isValidMark(f)) { cout << "[ERROR] Invalid FAT marks.\n"; return; }

        students.emplace_back(regNo, name, c1, c2, f);
        saveToFile();
        cout << "[SUCCESS] Student " << regNo << " added.\n";
    }

    // ---- SEARCH by RegNo ----
    void searchStudent() {
        string regNo;
        cout << "\n--- Search Student ---\n";
        cout << "Enter RegNo: ";
        cin >> regNo;

        for (const auto& s : students) {
            if (s.getRegNo() == regNo) {
                printTableHeader();
                s.display();
                return;
            }
        }
        cout << "[NOT FOUND] No student with RegNo: " << regNo << "\n";
    }

    // ---- UPDATE marks for a student ----
    void updateStudent() {
        string regNo;
        cout << "\n--- Update Student Marks ---\n";
        cout << "Enter RegNo: ";
        cin >> regNo;

        for (auto& s : students) {
            if (s.getRegNo() == regNo) {
                float c1, c2, f;
                cout << "Enter new CAT1 (0-100): "; cin >> c1;
                if (!isValidMark(c1)) { cout << "[ERROR] Invalid.\n"; return; }
                cout << "Enter new CAT2 (0-100): "; cin >> c2;
                if (!isValidMark(c2)) { cout << "[ERROR] Invalid.\n"; return; }
                cout << "Enter new FAT  (0-100): "; cin >> f;
                if (!isValidMark(f))  { cout << "[ERROR] Invalid.\n"; return; }

                s.setCat1(c1); s.setCat2(c2); s.setFat(f);
                saveToFile();
                cout << "[SUCCESS] Marks updated for " << regNo << ".\n";
                return;
            }
        }
        cout << "[NOT FOUND] RegNo not found.\n";
    }

    // ---- DELETE a student (with confirmation) ----
    void deleteStudent() {
        string regNo;
        cout << "\n--- Delete Student ---\n";
        cout << "Enter RegNo to delete: ";
        cin >> regNo;

        for (auto it = students.begin(); it != students.end(); ++it) {
            if (it->getRegNo() == regNo) {
                char confirm;
                cout << "Confirm delete " << it->getName() << "? (y/n): ";
                cin >> confirm;
                if (confirm == 'y' || confirm == 'Y') {
                    students.erase(it);
                    saveToFile();
                    cout << "[SUCCESS] Student deleted.\n";
                } else {
                    cout << "[CANCELLED] Delete cancelled.\n";
                }
                return;
            }
        }
        cout << "[NOT FOUND] RegNo not found.\n";
    }

    // ---- DISPLAY all students ----
    void displayAll() {
        if (students.empty()) {
            cout << "\n[INFO] No records found.\n";
            return;
        }
        cout << "\n--- All Students ---\n";
        printTableHeader();
        for (const auto& s : students)
            s.display();
    }

    // ---- REPORT: Toppers ----
    void reportToppers() {
        if (students.empty()) { cout << "\n[INFO] No records.\n"; return; }
        float maxTotal = 0;
        for (const auto& s : students)
            if (s.getTotal() > maxTotal) maxTotal = s.getTotal();

        cout << "\n--- Topper(s) [Total: " << maxTotal << "] ---\n";
        printTableHeader();
        for (const auto& s : students)
            if (s.getTotal() == maxTotal) s.display();
    }

    // ---- REPORT: Class Statistics ----
    void reportClassStats() {
        if (students.empty()) { cout << "\n[INFO] No records.\n"; return; }

        float sumTotal = 0, maxT = students[0].getTotal(), minT = students[0].getTotal();
        for (const auto& s : students) {
            sumTotal += s.getTotal();
            if (s.getTotal() > maxT) maxT = s.getTotal();
            if (s.getTotal() < minT) minT = s.getTotal();
        }
        float avgTotal = sumTotal / students.size();

        cout << "\n--- Class Statistics ---\n";
        cout << "  Total Students : " << students.size()  << "\n";
        cout << "  Highest Total  : " << maxT              << "\n";
        cout << "  Lowest Total   : " << minT              << "\n";
        cout << "  Class Average  : " << fixed << setprecision(2) << avgTotal << "\n";
    }

    // ---- REPORT: Grade Distribution ----
    void reportGradeDistribution() {
        if (students.empty()) { cout << "\n[INFO] No records.\n"; return; }

        map<string, int> dist = {{"A",0},{"B",0},{"C",0},{"Fail",0}};
        for (const auto& s : students)
            dist[s.getGrade()]++;

        cout << "\n--- Grade Distribution ---\n";
        for (const auto& kv : dist)
            cout << "  Grade " << setw(5) << kv.first << " : " << kv.second << " student(s)\n";
    }

    // ---- Helper: Print table header ----
    void printTableHeader() {
        cout << string(80, '-') << "\n";
        cout << left
             << setw(14) << "RegNo"
             << setw(20) << "Name"
             << setw(7)  << "CAT1"
             << setw(7)  << "CAT2"
             << setw(7)  << "FAT"
             << setw(8)  << "Total"
             << setw(9)  << "Average"
             << setw(6)  << "Grade"
             << "\n";
        cout << string(80, '-') << "\n";
    }
};


// ============================================================
//  MAIN — Menu-driven interface
// ============================================================
int main() {
    StudentManager mgr;
    int choice;

    cout << "========================================\n";
    cout << "   MENTOR DASHBOARD – STUDENT TRACKER  \n";
    cout << "========================================\n";

    do {
        cout << "\n----- MAIN MENU -----\n";
        cout << " 1. Add Student\n";
        cout << " 2. Display All Students\n";
        cout << " 3. Search Student\n";
        cout << " 4. Update Marks\n";
        cout << " 5. Delete Student\n";
        cout << " 6. Report: Toppers\n";
        cout << " 7. Report: Class Statistics\n";
        cout << " 8. Report: Grade Distribution\n";
        cout << " 0. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1: mgr.addStudent();            break;
            case 2: mgr.displayAll();            break;
            case 3: mgr.searchStudent();         break;
            case 4: mgr.updateStudent();         break;
            case 5: mgr.deleteStudent();         break;
            case 6: mgr.reportToppers();         break;
            case 7: mgr.reportClassStats();      break;
            case 8: mgr.reportGradeDistribution(); break;
            case 0: cout << "Goodbye!\n";        break;
            default: cout << "[ERROR] Invalid choice. Try again.\n";
        }
    } while (choice != 0);

    return 0;
}
