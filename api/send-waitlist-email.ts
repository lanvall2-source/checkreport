// Vercel Serverless Function: 체크리포트 무료 체험 신청 시 자동 이메일 발송
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { companyName, managerName, email, phone, industry, siteCount } = req.body || {};

    if (!companyName || !managerName || !email) {
      return res.status(400).json({ error: "필수 정보가 누락되었습니다." });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || "lanvall2@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "체크리포트 <onboarding@resend.dev>";

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY 미설정: 시뮬레이션 모드로 처리됩니다.");
      return res.status(200).json({
        success: true,
        simulated: true,
        message: "신청이 안전하게 접수되었습니다. (API 키 등록 시 자동 이메일 발송)",
        recipient: email,
      });
    }

    const customerHtml = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #0f172a; padding: 32px 28px; text-align: left; }
          .logo { font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }
          .logo-badge { background: #2563eb; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 11px; margin-left: 8px; font-weight: 700; }
          .hero-title { color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 14px; margin-bottom: 6px; }
          .hero-sub { color: #94a3b8; font-size: 13px; margin: 0; }
          .content { padding: 32px 28px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px dashed #e2e8f0; }
          .row:last-child { border-bottom: none; }
          .label { color: #64748b; font-weight: 600; }
          .value { color: #0f172a; font-weight: 700; }
          .cta-btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin-top: 10px; }
          .footer { background: #f8fafc; padding: 20px 28px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              체크리포트 <span class="logo-badge">CheckReport Pro</span>
            </div>
            <div class="hero-title">14일 무료 체험 신청이 접수되었습니다!</div>
            <p class="hero-sub">현장에서 스마트폰으로 찰칵, 사무실 복귀 전 보고서 완료.</p>
          </div>
          
          <div class="content">
            <p style="font-size: 14px; font-weight: 700; color: #0f172a;">
              안녕하세요, <strong>${companyName} ${managerName}</strong>님.
            </p>
            <p style="font-size: 13px; color: #475569;">
              신청해 주신 정보가 정상 등록되었으며, 24시간 이내에 전담 매니저가 계정 활성화 안내 및 모바일 점검 전용 URL을 전송해 드릴 예정입니다.
            </p>

            <div class="card">
              <div style="font-size: 12px; font-weight: 800; color: #2563eb; margin-bottom: 10px;">신청 내역 확인</div>
              <div class="row"><span class="label">업체명</span><span class="value">${companyName}</span></div>
              <div class="row"><span class="label">담당자</span><span class="value">${managerName}</span></div>
              <div class="row"><span class="label">이메일</span><span class="value">${email}</span></div>
              ${phone ? `<div class="row"><span class="label">연락처</span><span class="value">${phone}</span></div>` : ""}
              <div class="row"><span class="label">업종</span><span class="value">${industry}</span></div>
              <div class="row"><span class="label">현장수</span><span class="value">${siteCount}</span></div>
              <div class="row"><span class="label">체험 혜택</span><span class="value" style="color: #2563eb;">14일 Pro 무료 (현장 25개 / A4 사진대지 무제한)</span></div>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://checkreport.vercel.app/" class="cta-btn" target="_blank">체크리포트 둘러보기</a>
            </div>
          </div>

          <div class="footer">
            본 메일은 체크리포트(https://checkreport.vercel.app)에서 무료 체험을 신청하신 고객님께 자동 발송되었습니다.<br>
            문의사항: support@checkreport.kr
          </div>
        </div>
      </body>
      </html>
    `;

    // 고객 확인 이메일 발송
    const customerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: `[체크리포트] ${companyName}님의 14일 무료 체험 신청이 정상 접수되었습니다.`,
        html: customerHtml,
      }),
    });

    const customerData = await customerRes.json();

    // 관리자 알림 이메일 발송
    if (adminEmail) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [adminEmail],
            subject: `[신규 신청 알림] ${companyName} (${managerName}님) 체크리포트 무료 체험 신청`,
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2>새로운 체크리포트 무료 체험 신청 접수</h2>
                <p><strong>업체명:</strong> ${companyName}</p>
                <p><strong>담당자:</strong> ${managerName}</p>
                <p><strong>이메일:</strong> ${email}</p>
                <p><strong>연락처:</strong> ${phone || "미입력"}</p>
                <p><strong>업종:</strong> ${industry}</p>
                <p><strong>현장수:</strong> ${siteCount}</p>
              </div>
            `,
          }),
        });
      } catch (adminErr) {
        console.warn("관리자 알림 실패:", adminErr);
      }
    }

    return res.status(200).json({ success: true, emailId: customerData.id });
  } catch (err: any) {
    return res.status(500).json({ error: "내부 서버 오류", message: err.message });
  }
}