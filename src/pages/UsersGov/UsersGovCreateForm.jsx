import React, { useState, useEffect } from 'react';
import { Input, Button, RadioGroup, Select, Breadcrumb, MultiSelect } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';

const UsersGovCreateForm = () => {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, reset } = useForm({ mode: 'onChange' });
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [associatedUser, setAssociatedUser] = useState("");
    const [associatedUsersOptions, setAssociatedUsersOptions] = useState([]);
    const watchedUsername = watch("username");
    const watchedCitizenCard = watch("citizen_card_number");
    //const watchedAssociatedUsers = watch("associated_users");

    const { id } = useParams();
    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/usersgov">Utilizadores Gov</Link> },
        { title: t('GOV_USERS_PAGE.ADD.title') },
    ];

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: data.username,
                ccNumber: data.citizen_card_number
            };
            let response;
            if(id){
                payload.id = Number(id);
                const result = associatedUsersOptions.filter(item => associatedUser.includes(item.value));
                payload.entities = result.map(item => ({
                    UserId: item.value,
                    Username: item.label
                }));
                response = await api.post('/gov-user/update', payload);
            } else {
                response = await api.post('/gov-user/create', payload);
            }
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage(id ? "Utilizador Gov atualizado com sucesso!" : "Utilizador Gov criado com sucesso!");
                setTimeout(() => {
                    navigate('/dashboard/usersgov');
                }, 2000);
            } else {
                setFeedbackMessage(id ? "Erro ao atualizar utilizador Gov. Tente novamente." : "Erro ao criar utilizador Gov. Tente novamente.");
            }
            
        } catch (error) {
            if (error.response?.status === 409) {
                setFeedbackMessage(id ? "Já existe um utilizador com este nome ou cartão de cidadão." : "Já existe um utilizador com este nome ou cartão de cidadão.");
            } else if (error.response?.status === 400) {
                setFeedbackMessage(id ? "Dados inválidos. Verifique as informações inseridas." : "Dados inválidos. Verifique as informações inseridas.");
            } else {
                setFeedbackMessage(id ? "Erro ao atualizar utilizador Gov. Tente novamente." : "Erro ao criar utilizador Gov. Tente novamente.");
            }
        } finally {
            setIsSubmitting(false);
            setShowFeedbackModal(true);
        }
    };
    useEffect(() => {
        if(id){
            const fetchUser = async () => {
                const response = await api.get(`/gov-user/${id}`);
                setAssociatedUser(response.data.result.entities.map(item => item.UserId));
                setValue("username", response.data.result.name);
                setValue("citizen_card_number", response.data.result.ccNumber);
                setValue("associated_users", response.data.result.entities.map(item => item.UserId));
                trigger("associated_users");
            };
            fetchUser();
        }
        const fetchAssociatedUsers = async () => {
            const response = await api.get('/user/all');
            setAssociatedUsersOptions(response.data.result.map(item => ({
                value: item.UserId,
                label: item.Username
            })));
        };
        fetchAssociatedUsers();
    }, []);

    const handleAssociatedUsersChange = (newUsers) => {
        setAssociatedUser(newUsers || []);
        setValue("associated_users", newUsers || []);
        trigger("associated_users");
    };

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{t('GOV_USERS_PAGE.ADD.title')}</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <p>{t('GOV_USERS_PAGE.ADD.description_usergov')}</p>
                <p>{t('GOV_USERS_PAGE.ADD.description_usergov1')}</p>
                <p>{t('GOV_USERS_PAGE.ADD.description_usergov2')}</p>
                <div className='w-50 d-flex flex-column gap-3'>
                    <Input
                        id="username"
                        value={watchedUsername}
                        darkTheme={theme}
                        label={t('GOV_USERS_PAGE.ADD.username_label')}
                        name="username"
                        type="text"
                        placeholder="Nome de utilizador"
                        {...register("username", {
                            required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
                            maxLength: { value: 50, message: "O nome não pode exceder 50 caracteres" },
                            pattern: {
                                value: /^[a-zA-Z0-9._-]+$/,
                                message: "Nome de utilizador inválido"
                            }
                        })}
                        onChange={e => setValue("username", e.target.value)}
                        error={errors.username?.message}
                    />

                    <Input
                        id="citizen_card_number"
                        label={t('GOV_USERS_PAGE.ADD.card_citizen_label')}
                        name="citizen_card_number"
                        type="text"
                        value={watchedCitizenCard}
                        darkTheme={theme}
                        placeholder="Número do cartão de cidadão"
                        {...register("citizen_card_number", {
                            required: <div dangerouslySetInnerHTML={{__html: t('MISC.required_field')}} />,
                            minLength: { value: 8, message: "O número deve ter pelo menos 8 caracteres" },
                            maxLength: { value: 20, message: "O número não pode exceder 20 caracteres" },
                            pattern: {
                                value: /^[0-9A-Za-z]+$/,
                                message: "Número de cartão inválido"
                            }
                        })}
                        onChange={e => setValue("citizen_card_number", e.target.value)}
                        error={errors.citizen_card_number?.message}
                    />

                    <MultiSelect
                        id="associated_users"
                        darkTheme={theme}
                        label={t('GOV_USERS_PAGE.ADD.users_associated_label')}
                        name="associated_users"
                        value={associatedUser  || []}
                        onChange={handleAssociatedUsersChange}
                        options={associatedUsersOptions}
                        placeholder="Selecione utilizadores associados"
                    />

                    <div className="d-flex justify-content-start">
                        <Button
                            darkTheme={theme}
                            type="submit"
                            text={isSubmitting ? "A guardar..." : (id ? "Atualizar e Sair" : t('ADMIN_CONSOLE.save_and_exit'))}
                            disabled={isSubmitting || !watchedUsername || !watchedCitizenCard}
                        />
                        <Button
                            className="ms-3"
                            darkTheme={theme}
                            type="button"
                            text="Sair"
                            variant="danger"
                            onClick={() => navigate('/dashboard/usersgov')}
                        />
                    </div>
                </div>
            </form>
            <Modal
                isOpen={showFeedbackModal}
                onRequestClose={() => setShowFeedbackModal(false)}
                title="Criar Utilizador Gov"
            >
                <p>{feedbackMessage}</p>
                <Button
                    darkTheme={theme}
                    text="OK"
                    className="btn-primary"
                    onClick={() => {
                        setShowFeedbackModal(false);
                        if (feedbackMessage === "Utilizador Gov criado com sucesso!") {
                            navigate('/dashboard/usersgov');
                        }
                    }}
                />
            </Modal>
        </div>
    );
}
export default UsersGovCreateForm;