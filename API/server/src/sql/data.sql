CREATE DATABASE IF NOT EXISTS GCS_CPP;

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) DEFAULT 'user',
    token VARCHAR(255) NOT NULL UNIQUE KEY
    FOREIGN KEY (role) REFERENCES roles(role_name)
);

CREATE TABLE history (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE badges (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    level INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE roles (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL,
    role_label VARCHAR(255) NOT NULL,
    INDEX idx_role_name (role_name)
);

CREATE TABLE permissions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(255) NOT NULL,
    permission VARCHAR(255) NOT NULL,
    FOREIGN KEY (role) REFERENCES roles(role_name)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

INSERT INTO users (username, password, role, token) VALUES ('admin', '$2y$10$UCPqJW//fV30lITlyX/VxuiD0WeVqXKb7viyE27CSdjH8xOlBtPsC', 'admin', "$2y$10$a9RrG1HkdPD2lDVhjb1jSeXDZ5xv6rr4SwescGZ1jXhItFHPTpcQ6");

INSERT INTO roles (role_name, role_label) VALUES ('admin', 'Administrateur');
INSERT INTO roles (role_name, role_label) VALUES ('user', 'Utilisater');
INSERT INTO roles (role_name, role_label) VALUES ('inviter', 'Inviter');

INSERT INTO permissions (role, permission) VALUES (
    'admin',
    'create_user'
)
INSERT INTO permissions (role, permission) VALUES (
    'admin',
    'delete_user'
)
INSERT INTO permissions (role, permission) VALUES (
    'admin',
    'update_user'
)
INSERT INTO permissions (role, permission) VALUES (
    'admin',
    'history_user'
)