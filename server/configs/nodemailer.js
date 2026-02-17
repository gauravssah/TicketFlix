import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send booking confirmation email with ticket details
 * @param {Object} booking - Populated booking document (user, show, show.movie)
 */
export const sendBookingEmail = async (booking) => {
    const { user, show, bookedSeats, amount } = booking;
    const movie = show.movie;

    const showDate = new Date(show.showDateTime).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const showTime = new Date(show.showDateTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    // Group seats by category
    const getSeatCategory = (seat) => {
        const row = seat.charAt(0).toUpperCase();
        if (['A', 'B'].includes(row)) return 'Premium';
        if (['C', 'D', 'E', 'F'].includes(row)) return 'Gold';
        return 'Silver';
    };

    const categoryColors = {
        Premium: { bg: '#eab308', text: '#422006', border: '#ca8a04' },   // Yellow — matches app
        Gold: { bg: '#a855f7', text: '#faf5ff', border: '#9333ea' },   // Purple — matches app
        Silver: { bg: '#6b7280', text: '#f9fafb', border: '#4b5563' },   // Gray   — matches app
    };

    const seatsByCategory = {};
    bookedSeats.forEach(seat => {
        const cat = getSeatCategory(seat);
        if (!seatsByCategory[cat]) seatsByCategory[cat] = [];
        seatsByCategory[cat].push(seat);
    });

    // Build seat category HTML rows
    const seatCategoryHtml = Object.entries(seatsByCategory).map(([category, seats]) => {
        const colors = categoryColors[category];
        return `
            <tr>
                <td style="padding:8px 0; vertical-align:middle; width:100px;">
                    <table cellpadding="0" cellspacing="0"><tr>
                        <td style="width:8px; height:8px; border-radius:2px; background-color:${colors.bg};"></td>
                        <td style="padding-left:8px; font-size:12px; font-weight:700; color:${colors.bg}; letter-spacing:0.3px;">${category}</td>
                    </tr></table>
                </td>
                <td style="padding:8px 0; padding-left:12px; vertical-align:middle;">
                    ${seats.map(s => `<span style="display:inline-block; background-color:${colors.bg}; color:${colors.text}; font-size:11px; font-weight:700; padding:4px 10px; border-radius:6px; margin:2px 3px; letter-spacing:0.5px;">${s}</span>`).join('')}
                </td>
            </tr>`;
    }).join('');

    const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0; padding:0; background-color:#0f0f17; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f17; padding:32px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e; border-radius:12px; overflow:hidden; border:1px solid #2a2a3e;">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #6c3ce0 0%, #a855f7 100%); padding:24px 32px; text-align:center;">
                                <h1 style="margin:0; color:#ffffff; font-size:24px; letter-spacing:1px;">🎬 TicketFlix</h1>
                                <p style="margin:6px 0 0; color:#e0d4fc; font-size:14px;">Booking Confirmation</p>
                            </td>
                        </tr>

                        <!-- Greeting -->
                        <tr>
                            <td style="padding:28px 32px 12px;">
                                <p style="color:#e0e0e0; font-size:16px; margin:0;">Hi <strong style="color:#a855f7;">${user.name}</strong>,</p>
                                <p style="color:#b0b0c0; font-size:14px; margin:8px 0 0;">Your booking has been confirmed! Here are your ticket details:</p>
                            </td>
                        </tr>

                        <!-- Movie Card -->
                        <tr>
                            <td style="padding:16px 32px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#12121a; border-radius:10px; overflow:hidden; border:1px solid #2a2a3e;">
                                    <tr>
                                        <!-- Poster -->
                                        <td width="140" style="vertical-align:top;">
                                            <img src="${posterUrl}" alt="${movie.title}" width="140" style="display:block; height:auto; border-radius:10px 0 0 10px;" />
                                        </td>
                                        <!-- Details -->
                                        <td style="padding:20px 24px; vertical-align:top;">
                                            <h2 style="margin:0 0 6px; color:#ffffff; font-size:20px;">${movie.title}</h2>
                                            <p style="margin:0 0 14px; color:#a0a0b4; font-size:12px;">${movie.genres ? movie.genres.map(g => g.name).join(' / ') : ''} · ${movie.runtime ? Math.floor(movie.runtime / 60) + 'h ' + (movie.runtime % 60) + 'm' : ''}</p>
                                            
                                            <table cellpadding="0" cellspacing="0" style="margin-top:6px;">
                                                <tr>
                                                    <td style="padding:4px 0; color:#808098; font-size:13px; width:80px;">Date</td>
                                                    <td style="padding:4px 0; color:#e0e0e0; font-size:13px; font-weight:600;">${showDate}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:4px 0; color:#808098; font-size:13px;">Time</td>
                                                    <td style="padding:4px 0; color:#e0e0e0; font-size:13px; font-weight:600;">${showTime}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:4px 0; color:#808098; font-size:13px;">Tickets</td>
                                                    <td style="padding:4px 0; color:#e0e0e0; font-size:13px; font-weight:600;">${bookedSeats.length}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Seat Categories -->
                        <tr>
                            <td style="padding:0 32px 16px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#12121a; border-radius:10px; padding:16px 20px; border:1px solid #2a2a3e;">
                                    <tr>
                                        <td colspan="2" style="padding:0 0 10px; color:#808098; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #2a2a3e;">
                                            🪑 Seat Details
                                        </td>
                                    </tr>
                                    ${seatCategoryHtml}
                                </table>
                            </td>
                        </tr>

                        <!-- Amount Paid -->
                        <tr>
                            <td style="padding:8px 32px 20px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#12121a; border-radius:10px; padding:16px 24px; border:1px solid #22c55e33;">
                                    <tr>
                                        <td style="color:#b0b0c0; font-size:14px;">Total Amount Paid</td>
                                        <td align="right" style="color:#22c55e; font-size:22px; font-weight:700;">$${amount}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Booking ID -->
                        <tr>
                            <td style="padding:0 32px 24px;">
                                <p style="margin:0; color:#606078; font-size:11px;">Booking ID: <span style="color:#808098;">${booking._id}</span></p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#12121a; padding:20px 32px; text-align:center; border-top:1px solid #2a2a3e;">
                                <p style="margin:0; color:#606078; font-size:12px;">You can download your ticket from the <strong>My Bookings</strong> page.</p>
                                <p style="margin:8px 0 0; color:#404058; font-size:11px;">© ${new Date().getFullYear()} TicketFlix. All rights reserved.</p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"TicketFlix" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
        to: user.email,
        subject: `🎟️ Booking Confirmed — ${movie.title} | ${showDate}`,
        html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent to:', user.email, '| MessageId:', info.messageId);
    return info;
};

export default transporter;
