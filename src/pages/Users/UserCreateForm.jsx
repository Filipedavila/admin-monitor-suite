import React, { useState, useEffect } from 'react';
import { Input, Button, RadioGroup, Breadcrumb, MultiSelect } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';

const UsersCreateForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, reset } = useForm({ mode: 'onChange' });
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [role, setRole] = useState('1');
    
    // States for websites association
    const [websiteOptions, setWebsiteOptions] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [defaultWebsites, setDefaultWebsites] = useState([]); // Original websites the user had
    const [websiteSearch, setWebsiteSearch] = useState("");

    const watchedPassword = watch("password");
    const watchedConfirmPassword = watch("confirmPassword");
    const watchedUsername = watch("username");
    const { id } = useParams();
    
    // Password strength validation helpers
    const passwordRequirements = {
        minLength: watchedPassword?.length >= 8,
        hasUpperCase: /[A-Z]/.test(watchedPassword || ""),
        hasLowerCase: /[a-z]/.test(watchedPassword || ""),
        hasNumber: /\d/.test(watchedPassword || ""),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword || "")
    };
    // Helper: validation rules for username
    const usernameValidation = {
        required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
        maxLength: { value: 50, message: "O nome não pode exceder 50 caracteres" },

    };
    // Dynamic password validation based on role
    const getPasswordValidation = () => {
        if (role === '2') {
            return {}; // No validation for MyMonitor
        }
        return {
            required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
            minLength: { value: 8, message: "A palavra-passe deve ter pelo menos 8 caracteres" },
            maxLength: { value: 100, message: "A palavra-passe não pode exceder 100 caracteres" },
            validate: {
                hasUpperCase: (value) => !value || /[A-Z]/.test(value) || "A palavra-passe deve conter pelo menos uma letra maiúscula",
                hasLowerCase: (value) => !value || /[a-z]/.test(value) || "A palavra-passe deve conter pelo menos uma letra minúscula",
                hasNumber: (value) => !value || /\d/.test(value) || "A palavra-passe deve conter pelo menos um número",
                hasSpecialChar: (value) => !value || /[!@#$%^&*(),.?":{}|<>]/.test(value) || "A palavra-passe deve conter pelo menos um caractere especial (!@#$%^&*...)"
            }
        };
    };

    const getConfirmPasswordValidation = () => {
        if (role === '2') {
            return {}; // No validation for MyMonitor
        }
        return {
            required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
        };
    };

    // Dynamic breadcrumbs - Users flow is linear, no dynamic context needed
    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/users">Utilizadores</Link> },
        { title: id ? (watchedUsername ? `${t('USERS_PAGE.ADD.edit_title')} ${watchedUsername}` : t('USERS_PAGE.ADD.edit_title')) : t('USERS_PAGE.ADD.title') },
    ];

    // Function to fetch websites
    const fetchWebsites = async (searchTerm = "") => {
        try {
            const response = await api.get(`/website/all/100000/0/sort=/direction=/search=${encodeURIComponent(searchTerm)}`);
            const websitesData = response.data.result || [];
            const formattedWebsites = websitesData.map(website => ({
                value: website.WebsiteId,
                label: website.StartingUrl
            }));
            
            // Merge search results with selected websites to ensure selected ones are always visible
            const selectedWebsiteIds = websites || [];
            const searchResultIds = formattedWebsites.map(w => w.value);
            
            // Find selected websites that are not in the search results
            const missingSelectedWebsites = websiteOptions.filter(opt => 
                selectedWebsiteIds.includes(opt.value) && !searchResultIds.includes(opt.value)
            );
            
            // Combine: selected websites that are missing + search results
            const mergedOptions = [...missingSelectedWebsites, ...formattedWebsites];
            
            // Remove duplicates based on value
            const uniqueOptions = mergedOptions.filter((option, index, self) =>
                index === self.findIndex((t) => t.value === option.value)
            );
            
            setWebsiteOptions(uniqueOptions);
        } catch (error) {
            console.error("Error fetching websites:", error);
            setWebsiteOptions([]);
        }
    };

    // Load initial websites and user data
    useEffect(() => {
        fetchWebsites("");
        
        const fetchUser = async () => {
            try {
                const response = await api.get(`/user/info/${id}`);
                const userData = response.data.result;
                
                setValue("username", userData.Username);
                setRole(userData.Type === "nimda" ? "1" : "2");
                
                // Load user's associated websites if available
                if (userData.websites && Array.isArray(userData.websites)) {
                    const websiteIds = userData.websites.map(w => {
                        // Handle different possible structures
                        if (typeof w === 'object' && w.WebsiteId) {
                            return w.WebsiteId;
                        } else if (typeof w === 'number' || typeof w === 'string') {
                            return w;
                        }
                        return null;
                    }).filter(id => id !== null);
                    
                    setWebsites(websiteIds);
                    setDefaultWebsites(websiteIds); // Store original websites
                    setValue("websites", websiteIds);
                } else {
                    setWebsites([]);
                    setDefaultWebsites([]);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setWebsites([]);
                setDefaultWebsites([]);
            }
        };
        if (id) {
            fetchUser();
        }
    }, [id, setValue]);

    useEffect(() => {
        // Clear websites when role is AMS (role === '1')
        if (role === '1') {
            setWebsites([]);
            setValue("websites", []);
        }
        
        // Clear password values and errors when switching roles
        setValue("password", "");
        setValue("confirmPassword", "");
        trigger(['password', 'confirmPassword']);
    }, [role, setValue, trigger]);

    // Handlers for website association
    const handleWebsiteSearch = (value) => {
        setWebsiteSearch(value || "");
        // Don't update websites state here, just search
        // The fetchWebsites function will be called with the updated websites state
        (async () => {
            try {
                const response = await api.get(`/website/all/100000/0/sort=/direction=/search=${encodeURIComponent(value || "")}`);
                const websitesData = response.data.result || [];
                const formattedWebsites = websitesData.map(website => ({
                    value: website.WebsiteId,
                    label: website.StartingUrl
                }));
                
                // Merge search results with selected websites to ensure selected ones are always visible
                const selectedWebsiteIds = websites || [];
                const searchResultIds = formattedWebsites.map(w => w.value);
                
                // Find selected websites that are not in the search results
                const missingSelectedWebsites = websiteOptions.filter(opt => 
                    selectedWebsiteIds.includes(opt.value) && !searchResultIds.includes(opt.value)
                );
                
                // Combine: selected websites that are missing + search results
                const mergedOptions = [...missingSelectedWebsites, ...formattedWebsites];
                
                // Remove duplicates based on value
                const uniqueOptions = mergedOptions.filter((option, index, self) =>
                    index === self.findIndex((t) => t.value === option.value)
                );
                
                setWebsiteOptions(uniqueOptions);
            } catch (error) {
                console.error("Error fetching websites:", error);
                setWebsiteOptions([]);
            }
        })();
    };

    const handleWebsiteChange = (newWebsites) => {
        setWebsites(newWebsites || []);
        setValue("websites", newWebsites || []);
    };

    const onSubmit = async (data) => {
 
        if (role !== '2' && data.password !== data.confirmPassword) {
            setFeedbackMessage("As palavras-passe não coincidem.");
            setShowFeedbackModal(true);
            return;
        }
        
        setIsSubmitting(true);

        try {
            let payload;
            payload = {
                username: data.username,
                password: data.password === "" ? "defaultAdmin123@" : data.password,
                confirmPassword: data.confirmPassword === "" ? "defaultAdmin123@" : data.confirmPassword,
                type: role === '1' ? "nimda" : "monitor",
                emails: "",
                names: "",
                websites: role === '1' ? [] : (websites || []),
                tags: []
            };

            let response;
            if(id){
                if(payload.password === ""){
                    delete payload.password;
                    delete payload.confirmPassword;
                }
           
                delete payload.tags;
                payload.websites = JSON.stringify(role === '1' ? [] : (websites || [])); // Current selection (original + new)
                payload.app = role === '1' ? "nimda" : "monitor";
                payload.defaultWebsites = JSON.stringify(role === '1' ? [] : (defaultWebsites || [])); // Only original websites
                payload.userId = Number(id);
                response = await api.post('/user/update', payload);
            }else{
                response = await api.post('/user/create', payload);
            }

         
            
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage(id ? "Utilizador atualizado com sucesso!" : "Utilizador criado com sucesso!");
                reset();
            } else {
                setFeedbackMessage(id ? "Erro ao atualizar utilizador. Tente novamente." : "Erro ao criar utilizador. Tente novamente.");
            }
        } catch (error) {
            if (error.response?.status === 409) {
                setFeedbackMessage("Já existe um utilizador com este nome.");
            } else if (error.response?.status === 400) {
                setFeedbackMessage("Dados inválidos. Verifique as informações inseridas.");
            } else {
                setFeedbackMessage(id ? "Erro ao atualizar utilizador. Tente novamente." : "Erro ao criar utilizador. Tente novamente.");
            }
        } finally {
            setIsSubmitting(false);
            setShowFeedbackModal(true);
        }
    };

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{id ? (watchedUsername ? `${t('USERS_PAGE.ADD.edit_title')} ${watchedUsername}` : t('USERS_PAGE.ADD.edit_title')) : t('USERS_PAGE.ADD.title')}</h1>
            <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
                <p>{t('USERS_PAGE.ADD.description_user')}</p>
                <p>{t('USERS_PAGE.ADD.description_user_ams')}</p>
                <div className='w-50 d-flex flex-column gap-3'>
                    <Input
                        label={t('USERS_PAGE.ADD.username_label')}
                        name="username"
                        type="text"
                        darkTheme={theme}
                        value={watchedUsername}
                        placeholder="Nome de utilizador"
                        {...register("username", usernameValidation)}
                        onChange={e => setValue("username", e.target.value)}
                        error={errors.username?.message}
                        autoComplete="off"
                    />
                    <div>
                        <label className="form-label">{t('USERS_PAGE.ADD.application_label')}</label>
                        <RadioGroup
                            darkTheme={theme}
                            data={[
                                { id: '1', name: t('MENU.admin_console') },
                                { id: '2', name: t('MENU.my_monitor') },
                                { id: '3', name: t('MENU.study_monitor') },
                            ]}
                            inline
                            onChange={(val) => { setRole(val); }}
                            value={role}
                        />
                    </div>

                    {role !== '1' && (
                        <MultiSelect
                            id="websites"
                            darkTheme={theme}
                            label={t('USERS_PAGE.ADD.websites_label') + ` (${t('HEADER.optional')})`}
                            name="websites"
                            value={websites || []}
                            onChange={handleWebsiteChange}
                            onInputChange={handleWebsiteSearch}
                            options={websiteOptions || []}
                            placeholder="Selecione websites (opcional)"
                            isValid={true}
                        />
                    )}
                
                        <>
                            <Input
                                key={`password-${role}`}
                                label={t('USERS_PAGE.ADD.password_label') + (role === '2' ? " (opcional)" : "")}
                                name="password"
                                type="password"
                                showPassTextAria={t('LOGIN.show_password')}
                                hidePassTextAria={t('LOGIN.hide_password')}
                                darkTheme={theme}
                                placeholder="Palavra-passe"
                                {...register("password", getPasswordValidation())}
                                onChange={e => setValue("password", e.target.value)}
                                error={errors.password?.message}
                                autoComplete="off"
                                aria-describedby={role !== '2' ? "password-requirements" : undefined}
                            />
                            
                            {role !== '2' && (
                                <div 
                                    id="password-requirements"
                                    role="region"
                                    aria-label="Requisitos da palavra-passe"
                                    style={{ 
                                        marginTop: '-8px', 
                                        marginBottom: '16px', 
                                        padding: '12px', 
                                        backgroundColor: '#f8f9fa', 
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#495057' }} id="password-requirements-title">
                                        A palavra-passe deve ter:
                                    </p>
                                    <ul 
                                        style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}
                                        aria-labelledby="password-requirements-title"
                                        aria-live="polite"
                                        aria-relevant="all"
                                    >
                                        <li style={{ 
                                                color: watchedPassword ? (passwordRequirements.minLength ? '#198754' : '#dc3545') : '#495057',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            <span aria-hidden="true">{watchedPassword ? (passwordRequirements.minLength ? '✓' : '✗') : '•'}</span> Pelo menos 8 caracteres
                                        </li>
                                        <li style={{ 
                                                color: watchedPassword ? (passwordRequirements.hasUpperCase ? '#198754' : '#dc3545') : '#495057',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            <span aria-hidden="true">{watchedPassword ? (passwordRequirements.hasUpperCase ? '✓' : '✗') : '•'}</span> Pelo menos uma letra maiúscula (A-Z)
                                        </li>
                                        <li style={{ 
                                                color: watchedPassword ? (passwordRequirements.hasLowerCase ? '#198754' : '#dc3545') : '#495057',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            <span aria-hidden="true">{watchedPassword ? (passwordRequirements.hasLowerCase ? '✓' : '✗') : '•'}</span> Pelo menos uma letra minúscula (a-z)
                                        </li>
                                        <li style={{ 
                                                color: watchedPassword ? (passwordRequirements.hasNumber ? '#198754' : '#dc3545') : '#495057',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            <span aria-hidden="true">{watchedPassword ? (passwordRequirements.hasNumber ? '✓' : '✗') : '•'}</span> Pelo menos um número (0-9)
                                        </li>
                                        <li style={{ 
                                                color: watchedPassword ? (passwordRequirements.hasSpecialChar ? '#198754' : '#dc3545') : '#495057'
                                            }}
                                        >
                                            <span aria-hidden="true">{watchedPassword ? (passwordRequirements.hasSpecialChar ? '✓' : '✗') : '•'}</span> Pelo menos um caractere especial (!@#$%^&*...)
                                        </li>
                                    </ul>
                                </div>
                            )}
                            
                            <Input
                                key={`confirmPassword-${role}`}
                                label={t('USERS_PAGE.ADD.confirm_password_label') + (role === '2' ? " (opcional)" : "")}
                                name="confirmPassword"
                                type="password"
                                showPassTextAria={t('LOGIN.show_password')}
                                hidePassTextAria={t('LOGIN.hide_password')}
                                darkTheme={theme}
                                placeholder="Confirmar palavra-passe"
                                {...register("confirmPassword", getConfirmPasswordValidation())}
                                onChange={e => setValue("confirmPassword", e.target.value)}
                                error={errors.confirmPassword?.message}
                                autoComplete="off"
                            />
                        </>
                    
                   

                    <div className="d-flex justify-content-start">
                        <Button
                            darkTheme={theme}
                            type="submit"
                            text={isSubmitting ? "A guardar..." : id ? t('ADMIN_CONSOLE.update_and_exit') : t('ADMIN_CONSOLE.save_and_exit')}
                            disabled={
                                !id
                                  ? (
                                      isSubmitting ||
                                      !watchedUsername ||
                                      (role !== '2' && (!watchedPassword || !watchedConfirmPassword))
                                    )
                                  : false
                            }
                        />
                        <Button
                            className="ms-3"
                            darkTheme={theme}
                            text="Sair"
                            variant="danger"
                            onClick={() => navigate('/dashboard/users')}
                        />
                    </div>
                </div>
            </form>
            <Modal
                isOpen={showFeedbackModal}
                onRequestClose={() => setShowFeedbackModal(false)}
                title={id ? "Atualizar Utilizador" : "Criar Utilizador"}
            >
                <p>{feedbackMessage}</p>
                <Button
                    darkTheme={theme}
                    text="OK"
                    className="btn-primary"
                    onClick={() => {
                        setShowFeedbackModal(false);
                        if (feedbackMessage === "Utilizador criado com sucesso!" || feedbackMessage === "Utilizador atualizado com sucesso!") {
                            navigate('/dashboard/users');
                        }
                    }}
                />
            </Modal>
        </div>
    );
}
export default UsersCreateForm;