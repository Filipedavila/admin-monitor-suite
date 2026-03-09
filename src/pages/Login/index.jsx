import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "ama-design-system";
import Logo from "../../assets/logo-ams.svg";
import { useAuth } from "../../context/AuthContext";
import { getDefaultApiUrl, refreshApiBaseUrl } from "../../config/api";
import './login.css'
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const Login = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const { login, loading } = useAuth();
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const machineIP = (data.machineIP && data.machineIP.trim()) ? data.machineIP.trim() :getDefaultApiUrl() ;
      localStorage.setItem('@AMS:apiUrl', machineIP);
      refreshApiBaseUrl();
      const result = await login(data.username, data.password, machineIP);
      if (result.success) {
        navigate('/dashboard/home');
      } else {
        setLoginError(result.error);
      }
    } catch (error) {
      if(error.status === 401){
        setLoginError("Credenciais inválidas");
      } else{
        setLoginError("Erro ao fazer login");
      }
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
        aria-label={t('LOGIN.skip_link_label')}
      >
        {t('LOGIN.skip_link_text')}
      </a>
      <div className="main-content">
        <div className="login-container" id="main-content" role="main">
          <h1 className="login-title">
            <img src={Logo} alt={t('LOGIN.logo_alt')} className="login-logo" />
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="machineIP"
              name="machineIP"
              label={t('LOGIN.machineIP_label')}
              type="url"
              onChange={handleInputChange}
             
              error={errors.machineIP?.message}
            />
            <Input
              id="username"
              name="username"
              label={t('LOGIN.email_label')}
              type="text"
              onChange={handleInputChange}
           error={errors.email?.message}
            />
            <Input
              id="password"
              name="password"
              label={t('LOGIN.password_label')}
              type="password"
              onChange={handleInputChange}
              showPassTextAria={t('LOGIN.showPassTextAria')}
              hidePassTextAria={t('LOGIN.hidePassTextAria')}
              
              error={errors.password?.message}
            />
            {loginError && <p className="error-message">{loginError}</p>}
            <Button 
              type="submit" 
              text={loading ? t('LOGIN.loading_text') : t('LOGIN.submit')}
              disabled={loading}
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
