<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Team Invitation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 40px 20px; color: #1a1a2e; }
        .card { max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
        .header { background: linear-gradient(135deg, #1a2e3b, #0f1922); padding: 32px 32px 24px; text-align: center; }
        .header h1 { color: #39B1D1; font-size: 22px; margin: 0 0 4px; }
        .header p { color: rgba(255,255,255,.6); font-size: 13px; margin: 0; }
        .body { padding: 32px; }
        .body p { font-size: 15px; line-height: 1.6; color: #444; margin: 0 0 16px; }
        .role-badge { display: inline-block; background: #39B1D1; color: #fff; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: .05em; }
        .btn { display: inline-block; background: #39B1D1; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 32px; border-radius: 8px; margin: 8px 0 24px; }
        .btn:hover { background: #2d97b3; }
        .footer { padding: 20px 32px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
        .footer a { color: #39B1D1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>MeenitsTrac</h1>
            <p>Project Management</p>
        </div>
        <div class="body">
            <p>Hi there,</p>
            <p>
                <strong>{{ $inviterName }}</strong> has invited you to join
                <strong>{{ $teamName }}</strong> as a
                <span class="role-badge">{{ $role }}</span>.
            </p>
            <p>Click the button below to accept the invitation and get started:</p>
            <p style="text-align: center;">
                <a href="{{ $acceptUrl }}" class="btn">Accept Invitation</a>
            </p>
            @if($expiresAt)
                <p style="font-size: 13px; color: #888;">
                    This invitation expires on {{ $expiresAt }}.
                </p>
            @endif
            <p style="font-size: 13px; color: #888;">
                If you didn't expect this invitation, you can safely ignore this email.
            </p>
        </div>
        <div class="footer">
            <p>Sent from <a href="{{ url('/') }}">MeenitsTrac</a></p>
        </div>
    </div>
</body>
</html>
