<?php
session_start();

$error = '';

// Generate new random digits (5 digits like reference "1 3 2 0 3")
$d1 = rand(0, 9);
$d2 = rand(0, 9);
$d3 = rand(0, 9);
$d4 = rand(0, 9);
$d5 = rand(0, 9);

$challenge_display = "$d1 $d2 $d3 $d4 $d5";
$challenge_value = "$d1$d2$d3$d4$d5"; // Comparison value without spaces

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $captcha_input = $_POST['captcha'] ?? '';
    
    $expected_answer = $_SESSION['captcha_answer'] ?? '';

    // Check Captcha (Remove spaces from input just in case)
    if ($expected_answer === '' || str_replace(' ', '', $captcha_input) !== $expected_answer) {
        $error = "Incorrect CAPTCHA.";
    } 
    // Check Credentials
    elseif ($username === 'admin' && $password === 'password123') {
        $_SESSION['loggedin'] = true;
        $_SESSION['username'] = $username;
        header("Location: dashboard.php");
        exit;
    } 
    else {
        $error = "Check User ID or Password.";
    }
}

// Store answer for verification
$_SESSION['captcha_answer'] = $challenge_value;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="style.css">
    <!-- Using a simple Font Awesome for the refresh icon if available, or unicode -->
</head>
<body>

    <div class="login-container">
        <div class="login-card">
            
            <form method="POST" action="">
                <!-- User ID -->
                <div class="input-group">
                    <label for="username">User ID</label>
                    <input type="text" id="username" name="username" class="input-field" required value="<?php echo htmlspecialchars($username ?? ''); ?>">
                </div>

                <!-- Password -->
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" class="input-field" required>
                </div>

                <!-- CAPTCHA Section -->
                 <label class="captcha-label">CAPTCHA</label>
                <div class="captcha-section">
                    <!-- Numbers Display -->
                    <div class="captcha-display">
                        <?php echo $challenge_display; ?>
                    </div>

                    <!-- Refresh Button -->
                    <button type="button" class="refresh-btn" onclick="window.location.reload();" title="Refresh">
                        &#x27F3; <!-- Unicode Refresh Arrows -->
                    </button>

                    <!-- Input -->
                    <div class="captcha-input-container">
                        <input type="text" name="captcha" class="input-field" placeholder="Enter CAPTCHA" required autocomplete="off">
                    </div>
                </div>

                <?php if ($error): ?>
                    <p style="color: red; margin-bottom: 1rem; font-weight: bold; animation: shake 0.3s;">
                        <?php echo $error; ?>
                    </p>
                <?php endif; ?>

                <button type="submit" class="btn-primary">LOGIN</button>
            </form>
        </div>
    </div>

    <script src="script.js"></script>
    <style>
        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(5px); }
            50% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
            100% { transform: translateX(0); }
        }
    </style>
</body>
</html>
