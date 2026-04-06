# cpp-mini-project-25BCE1417
# 📊 Smart Student Performance System – Mentor Dashboard

A simple yet powerful **C++ OOP-based application** designed for faculty mentors to track and analyze student performance across internal and final assessments.

---

## 🚀 Overview

The **Mentor Dashboard** helps mentors move beyond just marks and gain **meaningful insights** into student performance using structured data, file handling, and analytics.

This project demonstrates core concepts of:

* Object-Oriented Programming (OOP)
* File Handling (persistent storage)
* Data Structures (`vector`)
* Basic Analytics & Reporting

---

## 🎯 Features

### 🧑‍🎓 Student Management

* Add new student records
* Search student by **RegNo**
* Update marks (CAT1, CAT2, FAT)
* Delete student record (with confirmation)

### 📈 Performance Computation

Each student includes:

* Total marks
* Average score
* Grade classification:

  * **A** (≥ 75)
  * **B** (≥ 60)
  * **C** (≥ 50)
  * **Fail** (< 50)

---

## 📊 Reports & Insights

* 🏆 **Topper(s)** based on total marks
* 📉 **Class Statistics**

  * Highest total
  * Lowest total
  * Average total
* 📊 **Grade Distribution**

  * Count of A, B, C, and Fail

---

## 💾 Data Persistence

* Student records are stored in a file
* Data is automatically **loaded on program startup**
* Ensures no data loss between executions

---

## ✅ Validation Rules

* Marks must be between **0–100**
* Duplicate **RegNo is not allowed**
* Safe deletion with mentor confirmation

---

## 🏗️ OOP Design

### `class Student`

Encapsulates individual student data and behavior:

* `computeTotal()`
* `computeAverage()`
* `computeGrade()`
* `display()`

### `class StudentManager`

Handles overall system operations:

* Manages `vector<Student>`
* File read/write operations
* CRUD operations (Create, Read, Update, Delete)
* Report generation

---

## 🛠️ Technologies Used

* **C++**
* STL (`vector`, `fstream`)
* Object-Oriented Programming

---

## 📌 Learning Outcomes

* Strong understanding of **OOP principles**
* Real-world usage of **file handling**
* Designing a **modular system**
* Implementing **basic analytics logic**

---

## 📷 Sample Use Cases

* Faculty tracking student progress
* Mini academic management system
* Beginner-friendly analytics project

---

## 🌟 Future Enhancements

* GUI using Qt / Web frontend
* Database integration (MySQL)
* Export reports to CSV/PDF
* Authentication system for mentors

---

## 🤝 Contributing

Pull requests are welcome! Feel free to improve features or add enhancements.

---

## 📄 License

This project is open-source and available under the MIT License.
