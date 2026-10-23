package com.example.musicweb.service;

import com.example.musicweb.entity.User;
import com.example.musicweb.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =========================
    // REGISTER
    // =========================

    public User register(
            String name,
            String email,
            String password) {

        name = name.trim();
        email = email.trim().toLowerCase();

        if (name.isEmpty()) {
            throw new RuntimeException(
                    "Vui lòng nhập họ tên."
            );
        }

        if (email.isEmpty()) {
            throw new RuntimeException(
                    "Vui lòng nhập email."
            );
        }

        if (password == null || password.length() < 6) {
            throw new RuntimeException(
                    "Mật khẩu phải có ít nhất 6 ký tự."
            );
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Email này đã được đăng ký."
            );
        }

        User user = new User();

        user.setName(name);
        user.setEmail(email);

        // Không lưu password gốc
        user.setPassword(
                passwordEncoder.encode(password)
        );

        return userRepository.save(user);
    }

    // =========================
    // LOGIN
    // =========================

    public User login(
            String email,
            String password) {

        if (email == null || password == null) {
            return null;
        }

        email = email.trim().toLowerCase();

        return userRepository
                .findByEmail(email)
                .filter(user ->
                        passwordEncoder.matches(
                                password,
                                user.getPassword()
                        )
                )
                .orElse(null);
    }
}