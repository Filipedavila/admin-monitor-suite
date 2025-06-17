import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "ama-design-system";
import Logo from "../../assets/logo-ams.svg";
import { useAuth } from "../../context/AuthContext";
import './login.css'
import { useNavigate } from "react-router-dom";
const Login = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const { login, loading } = useAuth();
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    console.log(data);
    setLoginError('');
   // const result = await login(data.email, data.password, data.machineIP);
   navigate('/dashboard/home');
    if (!result.success) {
      setLoginError(result.error);
    }
  };

  const handleInputChange = (e) => {
    console.log(e.target.value);
    const { name, value } = e.target;
    setValue(name, value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  return (
    <>
      <a 
        href="#main-content" 
        className="skip-link"
        aria-label="Saltar para o conteúdo principal"
      >
        Saltar para o conteúdo principal
      </a>
      <div className="main-content">
        <div className="login-container" id="main-content" role="main">
          <h1 className="login-title visually-hidden">Login</h1>
          <img src={Logo} alt="AdminMonitorSuite Login Logo" className="login-logo" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              name="machineIP"
              label="IP da Máquina"
              type="url"
              onChange={handleInputChange}
             
              error={errors.machineIP?.message}
            />
            <Input
              name="email"
              label="Email"
              type="email"
              onChange={handleInputChange}
           error={errors.email?.message}
            />
            <Input
              name="password"
              label="Password"
              type="password"
              onChange={handleInputChange}
              showPassTextAria="Mostrar senha"
              hidePassTextAria="Ocultar senha"
              
              error={errors.password?.message}
            />

            <Button 
              type="submit" 
              text={loading ? "A carregar..." : "Login"}
              disabled={loading}
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
