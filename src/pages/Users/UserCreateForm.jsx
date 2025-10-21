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
    const [websiteSearch, setWebsiteSearch] = useState("");

    const watchedPassword = watch("password");
    const watchedConfirmPassword = watch("confirmPassword");
    const watchedUsername = watch("username");
    const { id } = useParams();
    // Helper: validation rules for username
    const usernameValidation = {
        required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
        maxLength: { value: 50, message: "O nome não pode exceder 50 caracteres" },

    };
    const [passwordValidation, setPasswordValidation] = useState({
        required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
        minLength: { value: 6, message: "A palavra-passe deve ter pelo menos 6 caracteres" },
        maxLength: { value: 100, message: "A palavra-passe não pode exceder 100 caracteres" }
    });

    const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({
        required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
    });

    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        { title: id ? t('USERS_PAGE.ADD.edit_title') : t('USERS_PAGE.ADD.title') },
    ];

    // Function to fetch websites
    const fetchWebsites = async (searchTerm = "") => {
        try {
            const response = await api.get(`/website/all/100000/0/sort=/direction=/search=${encodeURIComponent(searchTerm)}`);
            const websitesData = response.data.result || [];
            const formattedWebsites = websitesData.map(website => ({
                value: website.WebsiteId,
                label: website.Name
            }));
            setWebsiteOptions(formattedWebsites);
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
                    setValue("websites", websiteIds);
                } else {
                    setWebsites([]);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setWebsites([]);
            }
        };
        if (id) {
            fetchUser();
        }
    }, [id, setValue]);

    useEffect(() => {
        if(role === '2'){
            setPasswordValidation({
                required: false,
            });
            setConfirmPasswordValidation({
                required: false,
                validate: false
            });
        } else {
            setPasswordValidation({
                required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
                minLength: { value: 6, message: "A palavra-passe deve ter pelo menos 6 caracteres" },
                maxLength: { value: 100, message: "A palavra-passe não pode exceder 100 caracteres" }
            });
            setConfirmPasswordValidation({
                required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />  ,
            });
        }
        
        // Clear websites when role is AMS (role === '1')
        if (role === '1') {
            setWebsites([]);
            setValue("websites", []);
        }
    }, [role, setValue]);

    // Handlers for website association
    const handleWebsiteSearch = (value) => {
        setWebsiteSearch(value || "");
        fetchWebsites(value || "");
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
            const payload = {
                username: data.username,
                password: data.password ?? "",
                confirmPassword: data.confirmPassword ?? "",
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
                payload.websites = JSON.stringify(role === '1' ? [] : (websites || []));
                payload.app = role === '1' ? "nimda" : "monitor";
                payload.defaultWebsites = JSON.stringify(role === '1' ? [] : (websites || []));
                payload.userId = id;
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
            <h1>{id ? t('USERS_PAGE.ADD.edit_title') : t('USERS_PAGE.ADD.title')}</h1>
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
                                label={t('USERS_PAGE.ADD.password_label') + (role === '2' ? " (opcional)" : "")}
                                name="password"
                                type="password"
                                showPassTextAria={t('LOGIN.show_password')}
                                hidePassTextAria={t('LOGIN.hide_password')}
                                darkTheme={theme}
                                placeholder="Palavra-passe"
                                {...register("password", passwordValidation)}
                                onChange={e => setValue("password", e.target.value)}
                                error={errors.password?.message}
                                autoComplete="off"
                            />
                            <Input
                                label={t('USERS_PAGE.ADD.confirm_password_label') + (role === '2' ? " (opcional)" : "")}
                                name="confirmPassword"
                                type="password"
                                showPassTextAria={t('LOGIN.show_password')}
                                hidePassTextAria={t('LOGIN.hide_password')}
                                darkTheme={theme}
                                placeholder="Confirmar palavra-passe"
                                {...register("confirmPassword", confirmPasswordValidation)}
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