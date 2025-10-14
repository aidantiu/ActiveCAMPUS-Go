"use client";
import IntroBg from "../assets/intro_bg.svg";
import logo from "../assets/activecampus_logo.svg";
import groupStudents from "../assets/group_students.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/firestore";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  sanitizeInput,
  checkRateLimit,
} from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error!;
    }

    // Validate username
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.valid) {
      newErrors.username = usernameValidation.error!;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error!;
    }

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check
    if (!checkRateLimit("registration", 3, 300000)) {
      // 3 attempts per 5 minutes
      setErrors({
        form: "Too many registration attempts. Please try again later.",
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Sanitize inputs
      const sanitizedEmail = formData.email.trim().toLowerCase();
      const sanitizedUsername = sanitizeInput(formData.username);

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        sanitizedEmail,
        formData.password
      );

      // Create user profile in Firestore
      await createUser(userCredential.user.uid, {
        displayName: sanitizedUsername,
        email: sanitizedEmail,
      });

      // Wait a moment for auth state to propagate
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Redirect to choose campus
      router.push("/choose-map");
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "This email is already registered" });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Invalid email address" });
      } else if (error.code === "auth/weak-password") {
        setErrors({ password: "Password is too weak" });
      } else {
        setErrors({ form: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center bg-no-repeat flex flex-col md:flex-row items-center justify-evenly p-6"
      style={{
        backgroundImage: `url(${IntroBg.src})`,
        backgroundSize: "cover",
      }}
    >
      <div className="flex flex-col justify-center items-center">
        <img
          src={logo.src}
          alt="ActiveCampus GO Logo"
          className="w-[700px] h-auto mb-6 absolute -top-15 md:-top-30 md:left-30"
        />
        <img
          src={groupStudents.src}
          alt=""
          className="w-[400px] h-auto top-80 left-70 hidden md:block md:absolute"
        />
      </div>
      <div className="bg-[#dfd2e9]/80 rounded-2xl shadow-2xl max-w-md p-8 mx-3 top-55 absolute md:right-60 md:top-20">
        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#c9f2bb] focus:border-transparent text-gray-800 ${
                errors.email ? "border-red-500" : "border-gray-800"
              }`}
              placeholder="your.email@example.com"
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#c9f2bb] focus:border-transparent text-gray-800 ${
                errors.username ? "border-red-500" : "border-gray-800"
              }`}
              placeholder="your_username"
              disabled={loading}
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#c9f2bb] focus:border-transparent text-gray-800 ${
                  errors.password ? "border-red-500" : "border-gray-800"
                }`}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            {/* Password Strength Checklist */}
            <div className="mt-1 space-y-1">
              <div
                className={`flex items-center text-xs ${
                  formData.password.match(/[A-Z]/)
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <span className="mr-1">
                  {formData.password.match(/[A-Z]/) ? "✓" : "○"}
                </span>
                At least 1 uppercase letter
              </div>
              <div
                className={`flex items-center text-xs ${
                  formData.password.length >= 8
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <span className="mr-1">
                  {formData.password.length >= 8 ? "✓" : "○"}
                </span>
                Minimum 8 characters
              </div>
              <div
                className={`flex items-center text-xs ${
                  formData.password.match(/[0-9]/)
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <span className="mr-1">
                  {formData.password.match(/[0-9]/) ? "✓" : "○"}
                </span>
                At least 1 number
              </div>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#c9f2bb] focus:border-transparent text-gray-800 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-800"
              }`}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Form Error */}
          {errors.form && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.form}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8ac1e3] hover:bg-[#71a2c1] text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#8ac1e3] hover:text-[#71a2c1] font-medium"
            >
              Log in here
            </a>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-gray-200/50 rounded-lg">
          <p className="text-xs text-gray-800 text-center">
            🔒 Your data is encrypted and secure. We never share your
            information.
          </p>
        </div>
      </div>
    </div>
  );
}
