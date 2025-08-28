// === ขั้นตอนที่ 1: ใส่ URL และ Key ของคุณที่นี่ ===
const SUPABASE_URL = 'https://zbclcoumjqozcsovlorw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiY2xjb3VtanFvemNzb3Zsb3J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTYwNjksImV4cCI6MjA3MTkzMjA2OX0.n4kNtuxm-_TzBORMWM5WXzuEkGzGd6BqkvDBcJz5fLg';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-schedule');
    const subjectSelect = document.getElementById('subject');
    const daySelect = document.getElementById('day');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const weekSelect = document.getElementById('week-select');
    const clearButton = document.getElementById('clear-schedule');

    const shortSubjectNames = {
    'คาถา': 'คาถา',
    'ป้องกันตัวจากศาสตร์มืด': 'ป้องฯ',
    'แปลงกาย': 'แปลงฯ',
    'ปรุงยา': 'ปรุงฯ',
    'สัตว์วิเศษ': 'สัตว์ฯ',
    'ดาราศาสตร์': 'ดาราฯ',
    'เล่นแร่แปรธาตุ': 'เล่นแร่ฯ',
    'การพยากรณ์': 'พยากรณ์',
    'สมุนไพร': 'สมุนไพร',
    'ประวัติศาสตร์เวทมนตร์': 'ประวัติฯ',
    'มักเกิ้ลศึกษา': 'มักเกิ้ลฯ',
    'การบิน': 'การบิน',
    'ตัวเลขมหัศจรรย์': 'เลขฯ',
    'ตัวอักษรรูน': 'รูน'
};
    
    // กำหนดสีสำหรับแต่ละวิชา (เชื่อมกับ CSS Class)
    const subjectColors = {
        'คาถา': 'subject-คาถา',
        'ป้องกันตัวจากศาสตร์มืด': 'subject-ป้องกันตัวจากศาสตร์มืด',
        'แปลงกาย': 'subject-แปลงกาย',
        'ปรุงยา': 'subject-ปรุงยา',
        'สัตว์วิเศษ': 'subject-สัตว์วิเศษ',
        'ดาราศาสตร์': 'subject-ดาราศาสตร์',
        'เล่นแร่แปรธาตุ': 'subject-เล่นแร่แปรธาตุ',
        'การพยากรณ์': 'subject-การพยากรณ์',
        'สมุนไพร': 'subject-สมุนไพร',
        'ประวัติศาสตร์เวทมนตร์': 'subject-ประวัติศาสตร์เวทมนตร์',
        'มักเกิ้ลศึกษา': 'subject-มักเกิ้ลศึกษา',
        'การบิน': 'subject-การบิน',
        'ตัวเลขมหัศจรรย์': 'subject-ตัวเลขมหัศจรรย์',
        'ตัวอักษรรูน': 'subject-ตัวอักษรรูน'
    };

    // ฟังก์ชันแปลงเวลาจาก HH:mm เป็นนาทีทั้งหมด
    const timeToMinutes = (time) => {
        const parts = time.split(':');
        const hour = parseInt(parts[0]);
        const minute = parseInt(parts[1]);
        
        let totalMinutes = hour * 60 + minute;
        if (hour >= 0 && hour <= 1 && totalMinutes < 1200) {
            totalMinutes += 24 * 60;
        }
        return totalMinutes;
    };

    // ฟังก์ชันสำหรับสร้างแถบสีในตาราง
    const renderSchedule = (schedule) => {
        const dayRow = document.getElementById(schedule.day);
        if (dayRow) {
            const startTotalMinutes = timeToMinutes(schedule.start_time);
            const endTotalMinutes = timeToMinutes(schedule.end_time);
            const tableStartMinutes = 20 * 60;

            const startColumn = Math.round((startTotalMinutes - tableStartMinutes) / 30) + 1 + 1;
            const endColumn = Math.round((endTotalMinutes - tableStartMinutes) / 30) + 1 + 1;
            
            const newScheduleBar = document.createElement('div');
            newScheduleBar.className = `schedule-bar ${subjectColors[schedule.subject]}`;
            // แสดงผลเวลาที่ผู้ใช้กรอกเข้ามาจริง
            const displaySubject = shortSubjectNames[schedule.subject] || schedule.subject;
            newScheduleBar.textContent = `${displaySubject} ${schedule.start_time.slice(0, 5)}-${schedule.end_time.slice(0, 5)}`;            
            newScheduleBar.style.gridColumnStart = startColumn;
            newScheduleBar.style.gridColumnEnd = endColumn;
            
            dayRow.appendChild(newScheduleBar);
        }
    };

    // โหลดข้อมูลจาก Supabase เมื่อเปิดหน้าเว็บ หรือเปลี่ยนสัปดาห์
    const loadSchedules = async () => {
        const selectedWeek = weekSelect.value;
        const { data, error } = await _supabase.from('schedules').select('*').eq('week', selectedWeek);
        
        if (error) {
            console.error('Error loading data:', error);
            return;
        }
        
        // ล้างตารางเดิมก่อนแสดงผลใหม่
        document.querySelectorAll('.day-row .schedule-bar').forEach(el => el.remove());
        
        data.forEach(renderSchedule);
    };

    // Event Listener เมื่อกดปุ่ม "เพิ่ม"
    addButton.addEventListener('click', async () => {
        const selectedSubject = subjectSelect.value;
        const selectedDay = daySelect.value;
        const selectedWeek = weekSelect.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        
        if (!selectedSubject || !selectedDay || !startTime || !endTime) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        
        if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
            alert('กรุณากรอกเวลาในรูปแบบ HH:mm (เช่น 20:00)');
            return;
        }

        const newSchedule = {
            subject: selectedSubject,
            day: selectedDay,
            week: parseInt(selectedWeek),
            start_time: startTime,
            end_time: endTime
        };

        const { error } = await _supabase.from('schedules').insert([newSchedule]);
        if (error) {
            console.error('Error adding schedule:', error);
            alert('ไม่สามารถเพิ่มตารางได้ กรุณาตรวจสอบ Console');
            return;
        }

        loadSchedules();
        
        startTimeInput.value = '';
        endTimeInput.value = '';
    });

    // Event Listener เมื่อกดปุ่ม "ล้างตาราง"
    clearButton.addEventListener('click', async () => {
        const selectedWeek = weekSelect.value;
        const confirmClear = confirm(`คุณแน่ใจหรือไม่ว่าต้องการล้างตารางเรียนของสัปดาห์ที่ ${selectedWeek}?`);
        
        if (confirmClear) {
            const { error } = await _supabase.from('schedules').delete().eq('week', selectedWeek);
            if (error) {
                console.error('Error clearing data:', error);
                return;
            }
            loadSchedules();
        }
    });

    weekSelect.addEventListener('change', loadSchedules);
    loadSchedules();
});