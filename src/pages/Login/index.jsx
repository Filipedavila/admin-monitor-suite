import React from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Breadcrumb } from "ama-design-system";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo-ams.svg";
import './login.css'

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();


  const onSubmit = (data) => {
    console.log("Login data:", data);
    // Add login logic here
  };

  return (
    <div className="main-content">
      <div className="login-container">
        <img src={Logo} alt="Logo" className="login-logo" />
        <form onSubmit={handleSubmit(onSubmit)}>
           <Input
            name="username"
            label="IP da Máquina"
            type="url"
            {...register("username", { required: true })}
            error={errors.username ? "Username is required" : undefined}
            />
          <Input
            name="username"
            label="Utilizador"
            type="text"
            {...register("username", { required: true })}
            error={errors.username ? "Username is required" : undefined}
            />
          <Input
            name="Senha"
            label="Password"
            type="password"
            {...register("password", { required: true })}
            error={errors.password ? "Password is required" : undefined}
            />
          <Button type="submit" text="Login" />
        </form>
      </div>
    </div>
  );
};

export default Login;
