import { useState, useEffect } from 'react';
import { Input, Button, Breadcrumb } from "@a12e/accessmonitor-ds";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';
import { extractNavigationContext } from '../../utils/navigation';

const EntitiesCreateForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({ mode: 'onChange' });
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const watchedEntityName = watch("entityName");
    const watchedFullName = watch("fullName");

    const previousPath = localStorage.getItem('previousPath') || '';
    const navContext = extractNavigationContext(previousPath);

    let breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/entities">Entidades</Link> },
        { title: id ? "Editar Instituição" : "Criar Instituição" },
    ];

    if (id && navContext && navContext.type === 'entity') {
        breadcrumbs = [
            { children: <Link to="/dashboard/home">Início</Link> },
            { children: <Link to="/dashboard/entities">Entidades</Link> },
            { children: <Link to={`/dashboard/entities/view/${id}`}>{watchedEntityName}</Link> },
            { title: "Editar Instituição" },
        ];
    }

    useEffect(() => {
        if (!id) return;
        const fetchInstitution = async () => {
            try {
                const response = await api.get(`/institutions/${id}`);
                const inst = response.data.data;
                setValue("entityName", inst.shortName);
                setValue("fullName", inst.longName);
            } catch (error) {
                console.error('Error fetching institution:', error);
            }
        };
        fetchInstitution();
    }, [id, setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                shortName: data.entityName,
                longName: data.fullName || null,
            };
            let response;
            if (id) {
                response = await api.patch('/institutions', { institutionId: Number(id), ...payload });
            } else {
                response = await api.post('/institutions', payload);
            }
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage(id ? "Instituição atualizada com sucesso!" : "Instituição criada com sucesso!");
                reset();
            } else {
                setFeedbackMessage("Erro ao salvar instituição. Tente novamente.");
            }
        } catch (error) {
            console.error('Error saving institution:', error);
            setFeedbackMessage("Erro ao salvar instituição. Tente novamente.");
        } finally {
            setIsSubmitting(false);
            setShowFeedbackModal(true);
        }
    };

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{t('ENTITIES_PAGE.ADD.title')}</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <p>{t('ENTITIES_PAGE.ADD.description_entity')}</p>
                <div className='w-50 d-flex flex-column gap-3'>
                    <h2>{id ? "Editar Instituição" : "Nova Instituição"}</h2>

                    <Input
                        id="entityName"
                        label={t('ENTITIES_PAGE.ADD.short_name_label')}
                        name="entityName"
                        type="text"
                        darkTheme={theme}
                        placeholder="Nome da instituição"
                        {...register("entityName", {
                            required: <div dangerouslySetInnerHTML={{ __html: t('MISC.required_field') }} />,
                            minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" },
                            maxLength: { value: 50, message: "Nome não pode exceder 50 caracteres" }
                        })}
                        value={watchedEntityName}
                        onChange={e => setValue("entityName", e.target.value)}
                        error={errors.entityName?.message}
                    />

                    <Input
                        id="fullName"
                        label={t('ENTITIES_PAGE.ADD.long_name_label') + ` ${t('HEADER.optional')}`}
                        name="fullName"
                        type="text"
                        darkTheme={theme}
                        placeholder="Nome completo da instituição (opcional)"
                        {...register("fullName", {
                            maxLength: { value: 200, message: "Nome completo não pode exceder 200 caracteres" },
                            pattern: {
                                value: /^[a-zA-ZÀ-ÿ0-9\s\-_.,()]+$/,
                                message: "Nome completo contém caracteres inválidos"
                            }
                        })}
                        value={watchedFullName}
                        onChange={e => setValue("fullName", e.target.value)}
                        error={errors.fullName?.message}
                    />

           
                    <div className="d-flex justify-content-start">
                        <Button
                            darkTheme={theme}
                            type="submit"
                            text={isSubmitting
                                ? (id ? "A atualizar..." : "A guardar...")
                                : (id ? "Atualizar e Sair" : t('ADMIN_CONSOLE.save_and_exit'))
                            }
                            disabled={isSubmitting || !watchedEntityName || watchedEntityName?.length < 2}
                        />
                        <Button
                            type="button"
                            className="ms-3"
                            darkTheme={theme}
                            text="Sair"
                            variant="danger"
                            onClick={() => navigate('/dashboard/entities')}
                        />
                    </div>
                </div>
            </form>

            <Modal
                isOpen={showFeedbackModal}
                onRequestClose={() => setShowFeedbackModal(false)}
                title={id ? "Editar Instituição" : "Criar Instituição"}
            >
                <p>{feedbackMessage}</p>
                <Button
                    darkTheme={theme}
                    text="OK"
                    className="btn-primary"
                    onClick={() => {
                        setShowFeedbackModal(false);
                        if (feedbackMessage === (id ? "Instituição atualizada com sucesso!" : "Instituição criada com sucesso!")) {
                            navigate('/dashboard/entities');
                        }
                    }}
                />
            </Modal>
        </div>
    );
};

export default EntitiesCreateForm;
