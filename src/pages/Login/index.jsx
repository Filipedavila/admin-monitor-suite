import React, { useState } from "react";
import { Button, Input } from "ama-design-system";
import Logo from "../../assets/logo-ams.svg"; 
import './style.module.css'

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", formData);
  };

  return (
    <div className="main-content">

    <div className="login-container">
      <img src={Logo} alt="Logo" className="login-logo" />
      <form onSubmit={handleSubmit}>
        <Input
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleInputChange}
          required
          />
        <Input
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          />
        <Button type="submit" text="Login" />
      </form>
    </div>
          </div>
  );
};

export default Login;
