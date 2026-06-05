<?php
session_start();

// Generate Math Problem
$num1 = rand(1, 9);
$num2 = rand(1, 9);
$operator = '+';
$answer = $num1 + $num2;

// Display String
$display_text = "$num1 $operator $num2 = ?";

// Store Answer in Session
$_SESSION['captcha_code'] = (string)$answer;

// Create image
$width = 150;
$height = 50;
$image = imagecreatetruecolor($width, $height);

// Colors
$bg_color = imagecolorallocate($image, 30, 41, 59); // Dark Blue-Grey matches theme
$text_color = imagecolorallocate($image, 0, 242, 254); // Neon Cyan
$line_color = imagecolorallocate($image, 255, 0, 85); // Neon Pink (Accent)
$pixel_color = imagecolorallocate($image, 255, 255, 255);

// Fill background
imagefilledrectangle($image, 0, 0, $width, $height, $bg_color);

// Add noise (lines)
for ($i = 0; $i < 5; $i++) {
    imageline($image, 
        rand(0, $width), rand(0, $height), 
        rand(0, $width), rand(0, $height), 
        $line_color
    );
}

// Add noise (dots)
for ($i = 0; $i < 50; $i++) {
    imagesetpixel($image, rand(0, $width), rand(0, $height), $pixel_color);
}

// Add text (Centered)
$font_size = 5; // Built-in font size (1-5)
$char_width = 9; // Approx width of font 5 char
$text_width = strlen($display_text) * $char_width;
$x = ($width - $text_width) / 2;
$y = ($height - 15) / 2;

imagestring($image, 5, $x, $y, $display_text, $text_color);

// Output
header('Content-type: image/png');
imagepng($image);
imagedestroy($image);
?>
