import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from "firebase/firestore"


export const markAbsentEmployees = async (employees, db) => {
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  for (const employee of employees) {
    try {
      // Check if employee has attendance record for today
      const attendanceRef = collection(db, "attendance")
      const q = query(attendanceRef, where("employeeId", "==", employee.id), where("date", "==", today))

      const snapshot = await getDocs(q)

      // If no attendance record for today, mark as absent
      if (snapshot.empty) {
        // Check if there's already an absent record
        const absentQ = query(
          attendanceRef,
          where("employeeId", "==", employee.id),
          where("date", "==", today),
          where("presentornot", "==", false),
        )

        const absentSnapshot = await getDocs(absentQ)

        // Only create absent record if one doesn't exist
        if (absentSnapshot.empty) {
          // Add absent record
          await addDoc(collection(db, "attendance"), {
            employeeId: employee.id,
            employeeName: employee.name,
            date: today,
            time: "-",
            timestamp: new Date().toISOString(),
            presentornot: false,
            location: { note: "Absent" },
          })

          // Update employee's attendance history
          const employeeRef = doc(db, "employees", employee.id)
          const employeeDoc = await getDoc(employeeRef)

          if (employeeDoc.exists()) {
            const attendanceHistory = employeeDoc.data().attendanceHistory || []

            // Add absent record to history
            attendanceHistory.push({
              date: today,
              time: "-",
              presentornot: false,
              location: { note: "Absent" },
            })

            // Keep only last 30 days
            const last30Days = attendanceHistory.slice(-30)

            // Update employee document
            await updateDoc(employeeRef, {
              attendanceHistory: last30Days,
            })
          }
        }
      }
    } catch (error) {
      console.error(`Error processing absent record for employee ${employee.id}:`, error)
    }
  }
}

// Function to get attendance statistics for an employee
export const getAttendanceStats = (attendanceHistory) => {
  const totalDays = 30
  const presentDays = attendanceHistory.filter((record) => record.presentornot).length
  const absentDays = attendanceHistory.filter((record) => !record.presentornot).length
  const attendanceRate = Math.round((presentDays / totalDays) * 100)

  return {
    totalDays,
    presentDays,
    absentDays,
    attendanceRate,
  }
}
