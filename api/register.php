<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/db.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    // Check for required fields only
    if (!isset($data['name'], $data['email'], $data['password'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    // Extract data with defaults for optional fields
    $name = trim($data['name']);
    $email = trim($data['email']);
    $password = $data['password'];
    $department = isset($data['department']) ? trim($data['department']) : '';
    $studentId = isset($data['studentId']) ? trim($data['studentId']) : '';

    // Basic validation
    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Required fields cannot be empty"]);
        exit;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid email format"]);
        exit;
    }

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Email already registered"]);
        exit;
    }

    // Check if student ID already exists (only if provided)
    if (!empty($studentId)) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE student_id = ?");
        $stmt->execute([$studentId]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(["error" => "Student ID already registered"]);
            exit;
        }
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert user - handle the case where department and student_id might be NULL
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, department, student_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
    $result = $stmt->execute([
        $name,
        $email,
        $hashedPassword,
        !empty($department) ? $department : null,
        !empty($studentId) ? $studentId : null
    ]);

    if ($result) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "User registered successfully",
            "user_id" => $pdo->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Registration failed"]);
    }

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(["error" => "Email or Student ID already exists"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Database error occurred"]);
    }
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "An error occurred"]);
}
?>