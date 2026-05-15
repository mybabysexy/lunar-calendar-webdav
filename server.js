const express = require('express');
const ical = require('ical-generator').default;
const { Lunar } = require('lunar-javascript');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    // Khởi tạo Lịch
    const calendar = ical({ 
        name: 'Lịch Âm 🌙',
        timezone: 'Asia/Ho_Chi_Minh',
        description: 'Lịch Âm Việt Nam tự động cập nhật'
    });

    const today = new Date();
    
    // Tự động tạo sự kiện ngày âm cho 365 ngày tới
    for (let i = 0; i < 365; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        // Chuyển đổi Dương sang Âm
        const lunarDate = Lunar.fromDate(currentDate);
        
        // Tạo event cho mỗi ngày
        let eventTitle = `${lunarDate.getDay()}/${lunarDate.getMonth()}`;
        if (lunarDate.getDay() === 1) eventTitle = `Mùng 1 tháng ${lunarDate.getMonth()}`;
        else if (lunarDate.getDay() === 15) eventTitle = `Rằm tháng ${lunarDate.getMonth()}`;

        calendar.createEvent({
            start: currentDate,
            end: currentDate,
            allDay: true,
            summary: `🌙 ${eventTitle}`,
            description: `Ngày âm: ${lunarDate.getDay()}/${lunarDate.getMonth()}/${lunarDate.getYear()} \nCan Chi: Ngày ${lunarDate.getDayInGanZhi()}, tháng ${lunarDate.getMonthInGanZhi()}, năm ${lunarDate.getYearInGanZhi()}`
        });
    }

    // Set Header để trình duyệt và App Lịch hiểu đây là file iCalendar
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="lunar.ics"');
    
    // Trả về nội dung file ICS
    res.send(calendar.toString());
});

app.listen(PORT, () => {
    console.log(`Lunar Calendar Server đang chạy tại http://localhost:${PORT}`);
});