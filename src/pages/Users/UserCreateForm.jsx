import { useState, useEffect, useRef } from 'react';
import qs from "qs";
import { Input, Button, RadioGroup, Select, Breadcrumb } from "@a12e/accessmonitor-ds";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';
import MultiSelectTable from '../../components/MultiSelectTable';
import { buildPasswordValidation, getPasswordRequirements } from '../../utils/passwordRules';

const UsersCreateForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({ mode: 'onChange' });
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [role, setRole] = useState('1');
    const [permission, setPermission] = useState('viewer');

    const permissionOptions = [
        { value: 'manager', label: 'Administrador' },
        { value: 'viewer', label: 'Leitor' },
        { value: 'editor', label: 'Editor' },
    ];

    // States for websites association
    const [websiteOptions, setWebsiteOptions] = useState([]);
    const [websites, setWebsites] = useState([]);
    const originalWebsiteIdsRef = useRef([]);

    const watchedPassword = watch("password");
    const watchedConfirmPassword = watch("confirmPassword");
    const watchedUsername = watch("username");
    const watchedCcNumber = watch("ccNumber");
    const { id } = useParams();

    // Password strength validation helpers (regras partilhadas em utils/passwordRules)
    const passwordRequirements = getPasswordRequirements(watchedPassword);
    // Helper: validation rules for username
    const usernameValidation = {
        required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
        maxLength: { value: 50, message: "O nome não pode exceder 50 caracteres" },

    };
    // Password is required and must be strong for every new user, regardless of role
    const passwordValidation = buildPasswordValidation({
        required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
        minLength: "A palavra-passe deve ter pelo menos 8 caracteres",
        maxLength: "A palavra-passe não pode exceder 100 caracteres",
        hasUpperCase: "A palavra-passe deve conter pelo menos uma letra maiúscula",
        hasLowerCase: "A palavra-passe deve conter pelo menos uma letra minúscula",
        hasNumber: "A palavra-passe deve conter pelo menos um número",
        hasSpecialChar: "A palavra-passe deve conter pelo menos um caractere especial (!@#$%^&*...)",
    });
    const confirmPasswordValidation = {
        required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
    };

    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/users">Utilizadores</Link> },
        { title: id ? (watchedUsername ? `${t('USERS_PAGE.ADD.edit_title')} ${watchedUsername}` : t('USERS_PAGE.ADD.edit_title')) : t('USERS_PAGE.ADD.title') },
    ];

    // Function to fetch websites
    const fetchWebsites = async (searchTerm = "") => {
        try {
            const queryObj = { pagination: { limit: 20, page: 1 } };
            if (searchTerm) queryObj.filters = { searchTerm };
            const query = qs.stringify(queryObj);
            const response = await api.get(`/websites?${query}`);
            const websitesData = response.data.data || [];
            const formattedWebsites = websitesData.map(website => ({
                value: website.id,
                label: website.title
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
                const response = await api.get(`/users/${id}`);
                const userData = response.data.data;

                setValue("username", userData.username);
                setValue("ccNumber", userData.ccNumber || "");
                const roleSlug = typeof userData.role === "string" ? userData.role : userData.role?.slug;
                setRole(roleSlug === "nimda" ? "1" : "2");
                setPermission(userData.permission || 'viewer');

                const websitesResponse = await api.get(`/users/${id}/websites`);
                const userWebsites = websitesResponse.data?.data ?? websitesResponse.data ?? [];
                const websiteSelected = userWebsites.map(w => ({ value: w.id, label: w.baseUrl }));

                originalWebsiteIdsRef.current = websiteSelected.map(w => w.value);
                setWebsites(websiteSelected);
                setValue("websites", websiteSelected.map(w => w.value));
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
        if (role === '1') {
            setWebsites([]);
            setValue("websites", []);
            setValue("ccNumber", "");
        }
    }, [role, setValue]);

    // Handlers for website association
    const handleWebsiteSearch = (value) => {
        fetchWebsites(value || "");
    };

    const handleWebsiteChange = (newWebsites) => {
        setWebsites(newWebsites || []);
        setValue("websites", (newWebsites || []).map(item => item.value));
    };

    const handlePermissionChange = (value) => {
        setPermission(value);
        setValue("permission", value);
    };

    const onSubmit = async (data) => {

        if (!id && data.password !== data.confirmPassword) {
            setFeedbackMessage("As palavras-passe não coincidem.");
            setShowFeedbackModal(true);
            return;
        }

        setIsSubmitting(true);

        try {
            let userId = id;

            if (id) {
                const payload = {
                    id: Number(id),
                    role: role === '1' ? "nimda" : "monitor",
                    permission: permission,
                };
                if (role === '2' && data.ccNumber) {
                    payload.ccNumber = data.ccNumber;
                }
                await api.patch('/users', payload);
            } else {
                const payload = {
                    username: data.username,
                    role: role === '1' ? "nimda" : "monitor",
                    password: data.password,
                    permission: permission,
                };
                if (role === '2' && data.ccNumber) {
                    payload.ccNumber = data.ccNumber;
                }
                const response = await api.post('/users', payload);
                userId = response.data?.data?.id ?? response.data?.id;
            }

            if (userId && role === '2') {
                const currentIds = new Set(websites.map(item => Number(item.value)));
                const originalIds = new Set(originalWebsiteIdsRef.current);
                const add = [...currentIds].filter(wId => !originalIds.has(wId));
                const remove = [...originalIds].filter(wId => !currentIds.has(wId));
                if (add.length > 0 || remove.length > 0) {
                    await api.patch(`/users/${userId}/websites`, { add, remove });
                }
            }

            setFeedbackMessage(id ? "Utilizador atualizado com sucesso!" : "Utilizador criado com sucesso!");
            reset();
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
                        disabled={!!id}
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
                            ]}
                            inline
                            onChange={(val) => { setRole(val); }}
                            value={role}
                        />
                    </div>

                    <Select
                        id="permission"
                        darkTheme={theme}
                        label="Permissões"
                        name="permission"
                        options={permissionOptions}
                        value={permission}
                        onChange={handlePermissionChange}
                    />
                    <p className="text-muted" style={{ marginTop: "-8px" }}>
                        Nota: Administrador - Gestão completa do AMS/MyMonitor; Leitor - Apenas lê informação
                    </p>

                    {role === '2' && (
                        <MultiSelectTable
                            id="websites"
                            darkTheme={theme}
                            label={t('USERS_PAGE.ADD.websites_label') + ` (${t('HEADER.optional')})`}
                            selected={websites || []}
                            onSelectedChange={handleWebsiteChange}
                            onInputChange={handleWebsiteSearch}
                            options={websiteOptions || []}
                            placeholder="Selecione websites (opcional)"
                            isValid={true}
                            columnLabel="Sítio Web"
                            tableCaption="Sítios web selecionados"
                            emptyMessage="Nenhum sítio web selecionado."
                        />
                    )}

                    {role === '2' && (
                        <Input
                            label="Número de CC"
                            name="ccNumber"
                            type="text"
                            darkTheme={theme}
                            value={watchedCcNumber}
                            placeholder="Número de CC"
                            {...register("ccNumber")}
                            onChange={e => setValue("ccNumber", e.target.value)}
                            error={errors.ccNumber?.message}
                            autoComplete="off"
                        />
                    )}

                    {!id && (
                        <>
                            <Input
                                label={t('USERS_PAGE.ADD.password_label')}
                                name="password"
                                type="password"
                                showPassTextAria={t('LOGIN.show_password')}
                                hidePassTextAria={t('LOGIN.hide_password')}
                                darkTheme={theme}
                                value={watchedPassword || ""}
                                placeholder="Palavra-passe"
                                {...register("password", passwordValidation)}
                                onChange={e => setValue("password", e?.target?.value ?? e)}
                                error={errors.password?.message}
                                autoComplete="off"
                                aria-describedby="password-requirements"
                            />

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

                            <Input
                                label={t('USERS_PAGE.ADD.confirm_password_label')}
                                name="confirmPassword"
                                type="password"
                                showPassTextAria={t('LOGIN.show_password')}
                                hidePassTextAria={t('LOGIN.hide_password')}
                                darkTheme={theme}
                                placeholder="Confirmar palavra-passe"
                                value={watchedConfirmPassword || ""}
                                {...register("confirmPassword", confirmPasswordValidation)}
                                onChange={e => setValue("confirmPassword", e?.target?.value ?? e)}
                                error={errors.confirmPassword?.message}
                                autoComplete="off"
                            />
                        </>
                    )}
                    {id && (
                        <p className="text-muted">
                            A palavra-passe só pode ser alterada pelo próprio utilizador, na sua área pessoal.
                        </p>
                    )}

                    <div className="d-flex justify-content-start">
                        <Button
                            darkTheme={theme}
                            type="submit"
                            text={isSubmitting ? "A guardar..." : id ? t('ADMIN_CONSOLE.update_and_exit') : t('ADMIN_CONSOLE.save_and_exit')}
                            disabled={
                                !id
                                  ? (isSubmitting || !watchedUsername || !watchedPassword || !watchedConfirmPassword)
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
