// Premium Movie Ticket PDF Generator using jsPDF
import { jsPDF } from "jspdf";

const generateTicket = async (booking, currency) => {
    // Landscape A5-ish ticket size (mm)
    const W = 210;
    const H = 100;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [H, W] });

    // ─── COLORS ───
    const gold = [185, 155, 95];
    const darkBg = [18, 18, 24];
    const cardBg = [26, 26, 34];
    const white = [255, 255, 255];
    const lightGray = [180, 180, 190];
    const midGray = [120, 120, 135];
    const green = [34, 197, 94];
    const accent = [168, 85, 247];

    // ─── MAIN BACKGROUND ───
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, W, H, "F");

    // ─── GOLD TOP BORDER STRIP ───
    doc.setFillColor(...gold);
    doc.rect(0, 0, W, 1.5, "F");

    // ─── GOLD BOTTOM BORDER STRIP ───
    doc.setFillColor(...gold);
    doc.rect(0, H - 1.5, W, 1.5, "F");

    // ─── LEFT POSTER SECTION BACKGROUND ───
    doc.setFillColor(...cardBg);
    doc.rect(0, 0, 62, H, "F");

    // ─── LEFT PANEL: MOVIE POSTER ───
    const posterX = 6;
    const posterY = 8;
    const posterW = 50;
    const posterH = 72;
    const title = booking.show.movie.title;
    const runtime = booking.show.movie.runtime;
    const hrs = Math.floor(runtime / 60);
    const mins = runtime % 60;
    const genres = booking.show.movie.genres
        .slice(0, 3)
        .map((g) => g.name)
        .join(" / ");

    // Try to load movie poster image
    let posterLoaded = false;
    try {
        const posterUrl = `https://image.tmdb.org/t/p/w500${booking.show.movie.poster_path}`;
        const imgData = await fetchImageAsDataURL(posterUrl);
        if (imgData) {
            // Draw poster filling the card area — clean, no text overlay
            doc.addImage(imgData, "JPEG", posterX, posterY, posterW, posterH);
            posterLoaded = true;
        }
    } catch (e) {
        console.log("Poster load failed, using text fallback:", e.message);
    }

    // Fallback: text-only poster card (if image failed)
    if (!posterLoaded) {
        doc.setFillColor(35, 30, 50);
        doc.roundedRect(posterX, posterY, posterW, posterH, 3, 3, "F");

        doc.setFillColor(...accent);
        doc.roundedRect(posterX, posterY, posterW, 3, 3, 3, "F");
        doc.setFillColor(35, 30, 50);
        doc.rect(posterX, posterY + 2, posterW, 2, "F");

        doc.setFontSize(5.5);
        doc.setTextColor(...gold);
        doc.setFont("helvetica", "bold");
        doc.text("- NOW SHOWING -", posterX + posterW / 2, posterY + 10, { align: "center" });

        doc.setDrawColor(...gold);
        doc.setLineWidth(0.2);
        doc.line(posterX + 8, posterY + 13, posterX + posterW - 8, posterY + 13);

        doc.setFontSize(14);
        doc.setTextColor(...white);
        doc.setFont("helvetica", "bold");
        let titleLines = doc.splitTextToSize(title, posterW - 10);
        if (titleLines.length > 3) titleLines = titleLines.slice(0, 3);
        const lineH = 6.5;
        const titleBlockH = titleLines.length * lineH;
        const titleZoneTop = posterY + 16;
        const titleZoneBot = posterY + posterH - 22;
        const titleStartY = titleZoneTop + (titleZoneBot - titleZoneTop) / 2 - titleBlockH / 2 + lineH;
        doc.text(titleLines, posterX + posterW / 2, titleStartY, { align: "center", lineHeightFactor: 1.2 });

        doc.setDrawColor(...gold);
        doc.setLineWidth(0.2);
        doc.line(posterX + 8, posterY + posterH - 20, posterX + posterW - 8, posterY + posterH - 20);

        doc.setFontSize(5.5);
        doc.setTextColor(...lightGray);
        doc.setFont("helvetica", "normal");
        doc.text(genres, posterX + posterW / 2, posterY + posterH - 14, { align: "center" });

        doc.setFontSize(6);
        doc.setTextColor(...accent);
        doc.setFont("helvetica", "bold");
        doc.text(`${hrs}h ${mins}m`, posterX + posterW / 2, posterY + posterH - 8, { align: "center" });
    }

    // Gold border around poster
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(posterX, posterY, posterW, posterH, 3, 3, "S");

    // ─── PERFORATED TEAR LINE ───
    doc.setDrawColor(80, 80, 95);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(64, 4, 64, H - 4);
    doc.setLineDashPattern([], 0);

    // Tear circles
    doc.setFillColor(...darkBg);
    doc.setDrawColor(80, 80, 95);
    doc.setLineWidth(0.3);
    doc.circle(64, 2, 2.5, "FD");
    doc.circle(64, H - 2, 2.5, "FD");

    // ─── RIGHT SECTION ───
    const rx = 72; // right content start X
    const rw = W - rx - 8; // available width

    // ─── BRAND HEADER ───
    doc.setFontSize(7);
    doc.setTextColor(...gold);
    doc.setFont("helvetica", "normal");
    doc.text("T I C K E T F L I X", rx, 9);

    doc.setFontSize(5.5);
    doc.setTextColor(...midGray);
    doc.text("MOVIE TICKET", rx, 13);

    // Gold divider line
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(rx, 15.5, rx + rw, 15.5);

    // Thin secondary line
    doc.setDrawColor(50, 50, 65);
    doc.setLineWidth(0.15);
    doc.line(rx, 16.5, rx + rw, 16.5);

    // ─── MOVIE TITLE (right section) ───
    doc.setFontSize(16);
    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    const maxTitleW = rw;
    const truncTitle = doc.getStringUnitWidth(title) * 16 / doc.internal.scaleFactor > maxTitleW
        ? title.substring(0, 24) + "..."
        : title;
    doc.text(truncTitle, rx, 24);

    // ─── GENRE + RUNTIME (right section, below title) ───
    doc.setFontSize(7);
    doc.setTextColor(...lightGray);
    doc.setFont("helvetica", "normal");
    doc.text(`${genres}  ·  ${hrs}h ${mins}m`, rx, 29);

    // ─── DETAIL GRID ───
    const gridY = 36;
    const col1 = rx;
    const col2 = rx + 46;
    const col3 = rx + 92;

    // Row 1: Date | Time | Tickets
    drawField(doc, "DATE", formatDate(booking.show.showDateTime), col1, gridY, gold, white);
    drawField(doc, "TIME", formatTime(booking.show.showDateTime), col2, gridY, gold, white);
    drawField(doc, "TICKETS", `${booking.bookedSeats.length}`, col3, gridY, gold, white);

    // Separator line
    doc.setDrawColor(50, 50, 65);
    doc.setLineWidth(0.15);
    doc.line(rx, gridY + 14, rx + rw, gridY + 14);

    // Row 2: Seat Categories
    const seatsY = gridY + 19;

    // Group seats by section
    const seatsBySection = { premium: [], gold: [], silver: [] };
    booking.bookedSeats.forEach((seat) => {
        const row = seat.charAt(0).toUpperCase();
        if (["A", "B"].includes(row)) seatsBySection.premium.push(seat);
        else if (["C", "D", "E", "F"].includes(row)) seatsBySection.gold.push(seat);
        else seatsBySection.silver.push(seat);
    });

    doc.setFontSize(5.5);
    doc.setTextColor(...gold);
    doc.setFont("helvetica", "normal");
    doc.text("SEAT CATEGORIES", col1, seatsY);

    let seatLineY = seatsY + 5;
    const sectionColors = {
        premium: [234, 179, 8],    // yellow
        gold: [168, 85, 247],      // purple
        silver: [156, 163, 175],   // gray
    };
    const sectionLabels = { premium: "Premium", gold: "Gold", silver: "Silver" };

    Object.keys(seatsBySection).forEach((section) => {
        const seats = seatsBySection[section];
        if (seats.length === 0) return;

        // Section label with colored dot
        doc.setFillColor(...sectionColors[section]);
        doc.circle(col1 + 1.2, seatLineY - 1, 1, "F");

        doc.setFontSize(6);
        doc.setTextColor(...lightGray);
        doc.setFont("helvetica", "bold");
        doc.text(sectionLabels[section] + ":", col1 + 4, seatLineY);

        doc.setFontSize(7);
        doc.setTextColor(...white);
        doc.setFont("helvetica", "bold");
        doc.text(seats.join("  ·  "), col1 + 24, seatLineY);

        seatLineY += 5;
    });

    // Separator line
    doc.setDrawColor(50, 50, 65);
    doc.setLineWidth(0.15);
    doc.line(rx, seatLineY + 1, rx + rw, seatLineY + 1);

    // ─── AMOUNT SECTION ───
    const amtY = seatLineY + 4;

    // Amount box background
    doc.setFillColor(30, 30, 42);
    doc.roundedRect(rx, amtY - 3, rw, 12, 2, 2, "F");
    doc.setDrawColor(60, 60, 75);
    doc.setLineWidth(0.2);
    doc.roundedRect(rx, amtY - 3, rw, 12, 2, 2, "S");

    // Paid badge (right side)
    if (booking.isPaid) {
        const badgeX = rx + rw - 28;
        const badgeY2 = amtY - 0.5;
        doc.setFillColor(34, 197, 94, 0.15);
        doc.roundedRect(badgeX, badgeY2, 24, 9, 4.5, 4.5, "F");
        doc.setDrawColor(...green);
        doc.setLineWidth(0.3);
        doc.roundedRect(badgeX, badgeY2, 24, 9, 4.5, 4.5, "S");
        doc.setFontSize(7);
        doc.setTextColor(...green);
        doc.setFont("helvetica", "bold");
        doc.text("PAID", badgeX + 12, badgeY2 + 6.2, { align: "center" });

        // Amount value next to PAID badge (left of badge)
        doc.setFontSize(12);
        doc.setTextColor(...white);
        doc.setFont("helvetica", "bold");
        doc.text(`${currency} ${booking.amount}`, badgeX - 4, amtY + 5, { align: "right" });
    } else {
        // Just amount if not paid
        doc.setFontSize(12);
        doc.setTextColor(...white);
        doc.setFont("helvetica", "bold");
        doc.text(`${currency} ${booking.amount}`, rx + 4, amtY + 5);
    }

    // Label on far left
    doc.setFontSize(5.5);
    doc.setTextColor(...midGray);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL AMOUNT", rx + 4, amtY + 2);

    // ─── BOOKING TIME (left panel bottom) ───
    doc.setFontSize(4.5);
    doc.setTextColor(...midGray);
    doc.setFont("helvetica", "normal");
    const bookedAt = new Date(booking.createdAt);
    doc.text(`Booked: ${formatDate(bookedAt)} at ${formatTime(bookedAt)}`, posterX + posterW / 2, posterY + posterH + 6, { align: "center" });

    // ─── DOWNLOAD TIME (left panel bottom line 2) ───
    const now = new Date();
    doc.setFontSize(4.5);
    doc.setTextColor(...midGray);
    doc.setFont("helvetica", "normal");
    doc.text(`Ticket Downloaded: ${formatDate(now)} at ${formatTime(now)}`, posterX + posterW / 2, posterY + posterH + 11, { align: "center" });

    // ─── BARCODE (right section bottom) ───
    const barcodeY = H - 16;
    drawBarcodePDF(doc, rx, barcodeY, 65, 5);

    // Booking ID + Branding (same bottom line, spaced apart)
    doc.setFontSize(4);
    doc.setTextColor(80, 80, 95);
    doc.setFont("courier", "normal");
    doc.text(`ID: ${booking._id || "XXXXXX"}`, rx, barcodeY + 8);

    doc.setFontSize(4);
    doc.setTextColor(80, 80, 95);
    doc.setFont("helvetica", "normal");
    doc.text("www.ticketflix.com", W - 8, barcodeY + 8, { align: "right" });

    // ─── GOLD CORNER ACCENTS ───
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    // Top-left
    doc.line(3, 3.5, 10, 3.5);
    doc.line(3, 3.5, 3, 10);
    // Top-right
    doc.line(W - 10, 3.5, W - 3, 3.5);
    doc.line(W - 3, 3.5, W - 3, 10);
    // Bottom-left
    doc.line(3, H - 3.5, 10, H - 3.5);
    doc.line(3, H - 10, 3, H - 3.5);
    // Bottom-right
    doc.line(W - 10, H - 3.5, W - 3, H - 3.5);
    doc.line(W - 3, H - 10, W - 3, H - 3.5);

    // ─── DOWNLOAD PDF ───
    const fileName = `TicketFlix-${booking.show.movie.title.replace(/\s+/g, "-")}-Ticket.pdf`;
    doc.save(fileName);
};

// ─── HELPER FUNCTIONS ───

function drawField(doc, label, value, x, y, labelColor, valueColor) {
    doc.setFontSize(5.5);
    doc.setTextColor(...labelColor);
    doc.setFont("helvetica", "normal");
    doc.text(label, x, y);

    doc.setFontSize(9);
    doc.setTextColor(...valueColor);
    doc.setFont("helvetica", "bold");
    doc.text(value, x, y + 6);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function drawBarcodePDF(doc, x, y, w, h) {
    const barCount = 50;
    const barW = w / barCount;
    for (let i = 0; i < barCount; i++) {
        const isThick = Math.random() > 0.5;
        const bw = isThick ? barW * 0.75 : barW * 0.35;
        const gray = 55 + Math.floor(Math.random() * 40);
        doc.setFillColor(gray, gray, gray + 15);
        doc.rect(x + i * barW + (barW - bw) / 2, y, bw, h, "F");
    }
}

// Fetch remote image and convert to base64 data URL for jsPDF
async function fetchImageAsDataURL(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export default generateTicket;
