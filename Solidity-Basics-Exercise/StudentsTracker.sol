pragma solidity ^0.4.25;

contract StudentsTracker{
    struct Student{
        uint8 numberInClass;
        string name;
        uint8[] marks;
    }
    
    mapping(address => Student) private students;
    address private owner = msg.sender;
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    
    function addStudent(uint8 numberInClass, string name, address studentAddr) onlyOwner public{
        Student memory currentStudent;
        currentStudent.name = name;
        currentStudent.numberInClass = numberInClass;
        currentStudent.marks;
        students[studentAddr] = currentStudent;
    }
    
    function addGradeToStudent(address studentAddr, uint8 grade) onlyOwner public{
        require(students[studentAddr].numberInClass != 0);
        students[studentAddr].marks.push(grade);
    }
    
    function getStudent(address studentAddr) view public returns (uint8, string, uint8[]){
        Student memory currentStudent;
        currentStudent = students[studentAddr];
        return (currentStudent.numberInClass, currentStudent.name, currentStudent.marks);
    }
}