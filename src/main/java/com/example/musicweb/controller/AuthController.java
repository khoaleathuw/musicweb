package com.example.musicweb.controller;

import com.example.musicweb.entity.User;
import com.example.musicweb.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // =========================
    // LOGIN / AUTH PAGE
    // =========================

    @GetMapping("/")
    public String authPage(Model model) {
        model.addAttribute("user", new User());
        return "auth";
    }

    @GetMapping("/login")
    public String loginPage(Model model) {
        model.addAttribute("user", new User());
        return "auth";
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        model.addAttribute("user", new User());
        return "auth";
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public String register(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password,
            Model model) {

        try {

            userService.register(name, email, password);

            model.addAttribute(
                    "success",
                    "Tạo tài khoản thành công! Hãy đăng nhập."
            );

            model.addAttribute("user", new User());

            return "auth";

        } catch (RuntimeException e) {

            model.addAttribute(
                    "registerError",
                    e.getMessage()
            );

            model.addAttribute("user", new User());

            return "auth";
        }
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public String login(
            @RequestParam String email,
            @RequestParam String password,
            HttpSession session,
            Model model) {

        User user = userService.login(email, password);

        if (user == null) {

            model.addAttribute(
                    "loginError",
                    "Email hoặc mật khẩu không chính xác."
            );

            model.addAttribute("user", new User());

            return "auth";
        }

        // Lưu user vào session
        session.setAttribute("user", user);

        // Login thành công
        return "redirect:/home";
    }

    // =========================
    // LOGOUT
    // =========================

    @GetMapping("/logout")
    public String logout(HttpSession session) {

        session.invalidate();

        return "redirect:/";
    }
}