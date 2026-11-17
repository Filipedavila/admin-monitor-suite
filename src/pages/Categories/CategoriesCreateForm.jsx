import { useState, useEffect, useCallback, useRef } from 'react';
import qs from 'qs';
import { Input, Button, Breadcrumb } from "@a12e/accessmonitor-ds";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';
import { extractNavigationContext } from '../../utils/navigation';
import MultiSelectTable from '../../components/MultiSelectTable';

const CategoriesCreateForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, reset } = useForm({ mode: 'onChange' });
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();

    const [directories, setDirectories] = useState([]);
    const [directoriesOptions, setDirectoriesOptions] = useState([]);
    const [isDirectoriesLoading, setIsDirectoriesLoading] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [websites, setWebsites] = useState([]);
    const [websitesOptions, setWebsitesOptions] = useState([]);
    const [isWebsitesLoading, setIsWebsitesLoading] = useState(false);

    const watchedName = watch("categoryName");

    // Original (as loaded) relations, used to compute add/remove diffs on submit
    const originalDirectoryIdsRef = useRef([]);
    const originalWebsiteIdsRef = useRef([]);
    const dirSearchTimeoutRef = useRef(null);
    const webSearchTimeoutRef = useRef(null);

    const previousPath = localStorage.getItem('previousPath') || '';
    const navContext = extractNavigationContext(previousPath);

    let breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/categories">Categorias</Link> },
        { title: id ? "Editar Categoria" : t('CATEGORIES_PAGE.ADD.title') },
    ];

    if (id && navContext && navContext.type === 'category') {
        const { categoryName } = navContext.data;
        breadcrumbs = [
            { children: <Link to="/dashboard/home">Início</Link> },
            { children: <Link to="/dashboard/categories">Categorias</Link> },
            { children: <Link to={`/dashboard/categories/view/${encodeURIComponent(categoryName)}`}>{categoryName}</Link> },
            { title: "Editar Categoria" },
        ];
    }

    const fetchDirectories = useCallback(async (search) => {
        setIsDirectoriesLoading(true);
        try {
            const queryObj = { pagination: { limit: 20, page: 1 } };
            if (search) queryObj.filters = { searchTerm: search };
            const query = qs.stringify(queryObj);
            const response = await api.get(`/directories?${query}`);
            const fetched = response.data.data.map(item => ({
                value: item.id,
                label: item.name,
            }));
            setDirectoriesOptions(fetched);
        } catch (error) {
            console.error('Error fetching directories:', error);
        } finally {
            setIsDirectoriesLoading(false);
        }
    }, []);

    const fetchWebsites = useCallback(async (search) => {
        setIsWebsitesLoading(true);
        try {
            const queryObj = { pagination: { limit: 20, page: 1 } };
            if (search) queryObj.filters = { searchTerm: search };
            const query = qs.stringify(queryObj);
            const response = await api.get(`/websites?${query}`);
            const fetched = response.data.data.map(item => ({
                value: item.id,
                label: item.title,
            }));
            setWebsitesOptions(fetched);
        } catch (error) {
            console.error('Error fetching websites:', error);
        } finally {
            setIsWebsitesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDirectories("");
        fetchWebsites("");
    }, [fetchDirectories, fetchWebsites]);

    useEffect(() => {
        if (!id) return;
        const fetchCategory = async () => {
            try {
                const response = await api.get(`/tags/${id}`);
                const cat = response.data.data;
                setValue("categoryName", cat.name);

                const dirSelected = (cat.directories || []).map(dir => ({ value: dir.id, label: dir.name }));
                originalDirectoryIdsRef.current = dirSelected.map(dir => dir.value);
                setDirectories(dirSelected);

                const webSelected = (cat.websites || []).map(web => ({ value: web.id, label: web.title }));
                originalWebsiteIdsRef.current = webSelected.map(web => web.value);
                setWebsites(webSelected);

                await Promise.all([fetchDirectories(""), fetchWebsites("")]);
            } catch (error) {
                console.error('Error fetching category:', error);
            }
        };
        fetchCategory();
    }, [id, reset]);

    const handleDirectoriesInputChange = (inputValue) => {
        if (dirSearchTimeoutRef.current) clearTimeout(dirSearchTimeoutRef.current);
        dirSearchTimeoutRef.current = setTimeout(() => {
            fetchDirectories(inputValue);
        }, 300);
    };

    const handleWebsitesInputChange = (inputValue) => {
        if (webSearchTimeoutRef.current) clearTimeout(webSearchTimeoutRef.current);
        webSearchTimeoutRef.current = setTimeout(() => {
            fetchWebsites(inputValue);
        }, 300);
    };

    const handleDirectoriesChange = (newDirs) => {
        const value = newDirs || [];
        setDirectories(value);
        setValue("directories", value.map(item => item.value));
        trigger("directories");
    };

    const handleWebsitesChange = (newWebsites) => {
        setWebsites(newWebsites || []);
    };

    const onSubmit = async (data) => {
        if (!data.categoryName || data.categoryName.length < 3) {
            setFeedbackMessage("O nome da categoria deve ter pelo menos 3 caracteres");
            setShowFeedbackModal(true);
            return;
        }
        setIsSubmitting(true);
        try {
            let response;
            let tagId = id ? Number(id) : undefined;
            if (id) {
                response = await api.patch(`/tags`, { tagId: Number(id), name: data.categoryName });
            } else {
                response = await api.post('/tags', { name: data.categoryName });
                tagId = response.data?.data?.id ?? response.data?.id;
            }

            if (response.status === 201 || response.status === 200) {
                // The Tag resource has no endpoint of its own to save its websites/directories —
                // that relation is only exposed from the Website/Directory side, so we diff and
                // call their allocation endpoints once per affected website/directory.
                if (tagId) {
                    const currentDirIds = new Set(directories.map(item => Number(item.value)));
                    const originalDirIds = new Set(originalDirectoryIdsRef.current);
                    const dirsToAdd = [...currentDirIds].filter(dId => !originalDirIds.has(dId));
                    const dirsToRemove = [...originalDirIds].filter(dId => !currentDirIds.has(dId));

                    const currentWebIds = new Set(websites.map(item => Number(item.value)));
                    const originalWebIds = new Set(originalWebsiteIdsRef.current);
                    const websitesToAdd = [...currentWebIds].filter(wId => !originalWebIds.has(wId));
                    const websitesToRemove = [...originalWebIds].filter(wId => !currentWebIds.has(wId));

                    await Promise.all([
                        ...dirsToAdd.map(dId => api.patch(`/directory/${dId}/tags`, { add: [tagId] })),
                        ...dirsToRemove.map(dId => api.patch(`/directory/${dId}/tags`, { remove: [tagId] })),
                        ...websitesToAdd.map(wId => api.patch(`/websites/${wId}/tags`, { add: [tagId] })),
                        ...websitesToRemove.map(wId => api.patch(`/websites/${wId}/tags`, { remove: [tagId] })),
                    ]);
                }

                setFeedbackMessage(id ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!");
                reset();
                setDirectories([]);
                setWebsites([]);
            } else {
                setFeedbackMessage("Erro ao salvar categoria. Tente novamente.");
            }
        } catch {
            setFeedbackMessage("Erro ao salvar categoria. Tente novamente.");
        } finally {
            setIsSubmitting(false);
            setShowFeedbackModal(true);
        }
    };

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{id ? "Editar Categoria" : "Criar Categoria"}</h1>
            <div className="bg-white p-4 mt-3">
                <p>{t('CATEGORIES_PAGE.ADD.description_category')}</p>
                <p>{t('CATEGORIES_PAGE.ADD.note')}</p>
                <div className='w-50 d-flex flex-column gap-4'>
                    <h2>{id ? "Editar Categoria" : "Nova Categoria"}</h2>

                    {/* form only wraps fields that don't render internal buttons */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="d-flex flex-column gap-4">
                            <Input
                                id="categoryName"
                                label={t('CATEGORIES_PAGE.ADD.name_label')}
                                name="categoryName"
                                type="text"
                                darkTheme={theme}
                                placeholder="Nome da categoria"
                                {...register("categoryName", {
                                    required: "Campo obrigatório",
                                    minLength: { value: 3, message: "Nome deve ter pelo menos 3 caracteres" },
                                    maxLength: { value: 100, message: "Nome não pode exceder 100 caracteres" }
                                })}
                                onChange={e => setValue("categoryName", e.target.value)}
                                value={watchedName}
                                error={errors.categoryName?.message}
                            />

                            <MultiSelectTable
                                id="directories"
                                darkTheme={theme}
                                label={t('CATEGORIES_PAGE.ADD.directories_label') + ` ${t('HEADER.optional')}`}
                                selected={directories}
                                onSelectedChange={handleDirectoriesChange}
                                options={directoriesOptions}
                                onInputChange={handleDirectoriesInputChange}
                                isLoading={isDirectoriesLoading}
                                placeholder="Pesquise e selecione diretórios..."
                                noOptionsMessage={() => "Nenhum diretório encontrado"}
                                loadingMessage={() => "A pesquisar..."}
                                isValid={true}
                                columnLabel="Diretório"
                                tableCaption="Diretórios selecionados"
                                emptyMessage="Nenhum diretório selecionado."
                            />
                        </div>
                    </form>

                    {/* Website picker lives outside the form to prevent internal buttons from submitting */}
                    <MultiSelectTable
                        id="websitePicker"
                        darkTheme={theme}
                        label={`${t('CATEGORIES_PAGE.ADD.websites_label')} ${t('HEADER.optional')}`}
                        selected={websites}
                        onSelectedChange={handleWebsitesChange}
                        options={websitesOptions}
                        onInputChange={handleWebsitesInputChange}
                        isLoading={isWebsitesLoading}
                        placeholder="Pesquise e selecione sítios web para adicionar..."
                        noOptionsMessage={() => "Nenhum sítio web encontrado"}
                        loadingMessage={() => "A pesquisar..."}
                        isValid={true}
                        columnLabel="Sítio Web"
                        tableCaption="Sítios web selecionados"
                        emptyMessage="Nenhum sítio web selecionado."
                    />

                    {/* Submit buttons outside the form, trigger submit via onClick */}
                    <div className="d-flex justify-content-start">
                        <Button
                            darkTheme={theme}
                            text={isSubmitting
                                ? (id ? "A atualizar..." : "A guardar...")
                                : (id ? "Atualizar e Sair" : t('ADMIN_CONSOLE.save_and_exit'))
                            }
                            disabled={isSubmitting || !watchedName || watchedName?.length < 3}
                            onClick={handleSubmit(onSubmit)}
                        />
                        <Button
                            className="ms-3"
                            darkTheme={theme}
                            text="Sair"
                            variant="danger"
                            onClick={() => navigate('/dashboard/categories')}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showFeedbackModal}
                onRequestClose={() => setShowFeedbackModal(false)}
                title={id ? "Editar Categoria" : "Criar Categoria"}
            >
                <p>{feedbackMessage}</p>
                <Button
                    darkTheme={theme}
                    text="OK"
                    className="btn-primary"
                    onClick={() => {
                        setShowFeedbackModal(false);
                        if (feedbackMessage === (id ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!")) {
                            navigate('/dashboard/categories');
                        }
                    }}
                />
            </Modal>
        </div>
    );
};

export default CategoriesCreateForm;
