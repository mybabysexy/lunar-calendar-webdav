const express = require('express');
const ical = require('ical-generator').default;
const { Solar } = require('lunar-javascript');

const app = express();
const PORT = process.env.PORT || 3000;
const TZ = 'Asia/Ho_Chi_Minh';
const DAY_MS = 24 * 60 * 60 * 1000;

// lunar-javascript trả Can Chi bằng chữ Hán (vd: 辛卯) => đổi sang tiếng Việt (Tân Mão)
const CAN = { '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu', '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý' };
const CHI = { '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ', '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi' };
const canChiVi = (ganZhi) => `${CAN[ganZhi[0]] ?? ganZhi[0]} ${CHI[ganZhi[1]] ?? ganZhi[1]}`;

// Lấy ngày hôm nay (năm/tháng/ngày) theo giờ Việt Nam, không phụ thuộc TZ của server/container
function todayInVietnam() {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const get = (type) => Number(parts.find((p) => p.type === type).value);
    return Date.UTC(get('year'), get('month') - 1, get('day'));
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
    // Không đặt timezone cho calendar: sự kiện cả ngày (VALUE=DATE) không cần múi giờ,
    // và nhờ vậy DTSTAMP được xuất ở dạng UTC (có hậu tố Z) đúng chuẩn RFC 5545.
    const calendar = ical({
        name: 'Lịch Âm 🌙',
        description: 'Lịch Âm Việt Nam tự động cập nhật',
        ttl: 24 * 60 * 60 // gợi ý app lịch làm mới mỗi ngày
    });

    const startMs = todayInVietnam();
    // DTSTAMP cố định theo ngày để mỗi lần tải lại không làm app lịch tưởng mọi sự kiện đều thay đổi
    const stamp = new Date(startMs);

    // Tự động tạo sự kiện ngày âm cho 365 ngày tới
    for (let i = 0; i < 365; i++) {
        // Mốc 00:00 UTC; ical-generator định dạng ngày cả ngày bằng thành phần UTC
        const day = new Date(startMs + i * DAY_MS);
        const nextDay = new Date(startMs + (i + 1) * DAY_MS);

        // Chuyển đổi Dương sang Âm
        const lunarDate = Solar.fromYmd(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate()).getLunar();

        let eventTitle = `${lunarDate.getDay()}/${lunarDate.getMonth()}`;
        if (lunarDate.getDay() === 1) eventTitle = `Mùng 1 tháng ${lunarDate.getMonth()}`;
        else if (lunarDate.getDay() === 15) eventTitle = `Rằm tháng ${lunarDate.getMonth()}`;

        const ymd = day.toISOString().slice(0, 10).replace(/-/g, '');

        calendar.createEvent({
            // UID cố định theo ngày: app lịch cập nhật đúng sự kiện thay vì xoá/tạo lại hàng loạt
            id: `lunar-${ymd}@lunar-calendar-webdav`,
            stamp,
            start: day,
            // DTEND của sự kiện cả ngày là "không bao gồm" (RFC 5545) => phải là ngày hôm sau.
            // Nếu DTEND = DTSTART, sự kiện dài 0 ngày và Android/Oppo sẽ không hiển thị.
            end: nextDay,
            allDay: true,
            summary: `🌙 ${eventTitle}`,
            description: `Ngày âm: ${lunarDate.getDay()}/${lunarDate.getMonth()}/${lunarDate.getYear()} \nCan Chi: Ngày ${canChiVi(lunarDate.getDayInGanZhi())}, tháng ${canChiVi(lunarDate.getMonthInGanZhi())}, năm ${canChiVi(lunarDate.getYearInGanZhi())}`
        });
    }

    // Set Header để trình duyệt và App Lịch hiểu đây là file iCalendar
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', 'inline; filename="lunar.ics"');

    // Trả về nội dung file ICS
    res.send(calendar.toString());
});

app.listen(PORT, () => {
    console.log(`Lunar Calendar Server đang chạy tại http://localhost:${PORT}`);
});
