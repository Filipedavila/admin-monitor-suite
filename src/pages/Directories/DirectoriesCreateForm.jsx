import { useState, useEffect, useCallback, useRef } from 'react';
import qs from 'qs';
import { Input, Button, RadioGroup, Breadcrumb } from "@a12e/accessmonitor-ds";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../config/api';
import { Modal } from '../../components/Modal';
import { extractNavigationContext } from '../../utils/navigation';
import MultiSelectTable from '../../components/MultiSelectTable';

const DirectoriesCreateForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, reset } = useForm({
        mode: 'onChange'
    });
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showInObservatory, setShowInObservatory] = useState('yes');
    const [format, setFormat] = useState('1');
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const searchTimeoutRef = useRef(null);
    // Tags as loaded from the backend, used to compute the add/remove diff on submit
    const originalTagIdsRef = useRef([]);
    const navigate = useNavigate();
    const { id } = useParams();

    const watchedName = watch("name");

    const fetchCategories = useCallback(async (search) => {
        setIsCategoriesLoading(true);
        try {
            const queryObj = { pagination: { limit: 20, page: 1 } };
            if (search) queryObj.filters = { searchTerm: search };
            const query = qs.stringify(queryObj);
            const response = await api.get(`/tags?${query}`);
            const fetched = response.data.data.map(item => ({
                value: item.id,
                label: item.name,
            }));
            setCategories(fetched);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsCategoriesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories("");
    }, [fetchCategories]);

    useEffect(() => {
        if (!id) return;
        const fetchDirectory = async () => {
            try {
                const response = await api.get(`/directories/${id}`);
                const dir = response.data.data;
                setValue("name", dir.name);
                setShowInObservatory(dir.isInObservatory ? 'yes' : 'no');
                setFormat(dir.tagMatchingStrategy);
                const tags = await api.get(`/directory/${dir.id}/tags`);
                const tagsFetched = tags.data.data.map(item => ({
                    value: item.id,
                    label: item.name,
                }));
                setTags(tagsFetched);
            } catch (error) {
                console.error('Error fetching directory:', error);
            }
        };
        fetchDirectory();
    }, [id, reset]);

    const handleCategoryInputChange = (inputValue) => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            fetchCategories(inputValue);
        }, 300);
    };

    const previousPath = localStorage.getItem('previousPath') || '';
    const navContext = extractNavigationContext(previousPath);

    let breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/directories">Diretórios</Link> },
        { title: id ? t('DIRECTORIES_PAGE.EDIT.title') : t('DIRECTORIES_PAGE.ADD.title') }
    ];

    if (id && navContext && navContext.type === 'directory') {
        breadcrumbs = [
            { children: <Link to="/dashboard/home">Início</Link> },
            { children: <Link to="/dashboard/directories">Diretórios</Link> },
            { children: <Link to={`/dashboard/directories/view/${id}`}>{watchedName}</Link> },
            { title: "Editar Diretório" }
        ];
    }

    const handleShowInObservatoryChange = (value) => {
        setShowInObservatory(value);
        setValue("show_in_observatory", value);
    };

    const handleFormatChange = (value) => {
        setFormat(value);
        setValue("format", value);
    };

    const handleEntitiesChange = (newEntities) => {
        const value = newEntities || [];
        setTags(value);
        setValue("tags", value.map(item => item.value));
        trigger("tags");
    };

    const onSubmit = async (data) => {
        if (tags.length === 0) {
            setFeedbackMessage("Pelo menos uma categoria deve ser selecionada");
            setShowFeedbackModal(true);
            return;
        }
        console.log(format)

        setIsSubmitting(true);
        try {
            let formData = {
                name: data.name,
                strategy: format,
                isInObservatory: showInObservatory === 'yes',
            };

            let response;
            let directoryId = id;
            if (id) {
                formData.directoryId = id;
                response = await api.patch(`/directories`, formData);
            } else {
                response = await api.post('/directories', formData);
                directoryId = response.data?.data?.id ?? response.data?.id;
            }

            if (response.status === 201 || response.status === 200) {
                if (directoryId) {
                    const currentTagIds = new Set(tags.map(item => Number(item.value)));
                    const originalTagIds = new Set(originalTagIdsRef.current);
                    const add = [...currentTagIds].filter(tagId => !originalTagIds.has(tagId));
                    const remove = [...originalTagIds].filter(tagId => !currentTagIds.has(tagId));
                    if (add.length > 0 || remove.length > 0) {
                        await api.patch(`/directory/${directoryId}/tags`, { add, remove });
                    }
                }

                setFeedbackMessage(id ? "Diretório atualizado com sucesso!" : "Diretório criado com sucesso!");
                reset();
                setShowInObservatory('yes');
                setFormat('1');
                setTags([]);
                navigate('/dashboard/directories');
            } else {
                setFeedbackMessage("Erro ao salvar diretório. Tente novamente.");
                setShowFeedbackModal(true);
            }
        } catch (error) {
            if (error.response?.status === 409) {
                setFeedbackMessage("Já existe um diretório com este nome. Escolha outro nome.");
            } else if (error.response?.status === 400) {
                setFeedbackMessage("Dados inválidos. Verifique as informações inseridas.");
            } else {
                setFeedbackMessage("Erro ao salvar diretório. Tente novamente.");
            }
            setShowFeedbackModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{id ? "Editar Diretório" : "Criar Diretório"}</h1>

            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <p>Um Diretório é um agregador de sítios web. Os Diretórios têm por objetivo publicar sítios web publicamente no Observatório. Os Diretórios são construídos com base nas Categorias/tags que se encontram agarradas aos sítios web.</p>
                <p>Os Diretórios podem ser construídos:</p>
                <ul>
                    <li>por interseção das Categorias. A interseção é uma operação entre conjuntos que resulta em um novo conjunto formado por todos os elementos que são comuns a dois ou mais conjuntos originais.</li>
                    <li>por reunião das Categorias. A reunião, ou união, de conjuntos refere-se à combinação de todos os elementos de dois ou mais conjuntos.</li>
                </ul>

                <div className='w-50 d-flex flex-column gap-3'>
                    <Input
                        label={t('DIRECTORIES_PAGE.ADD.name_label')}
                        name="name"
                        darkTheme={theme}
                        value={watchedName}
                        placeholder="Nome do diretório"
                        type="text"
                        {...register("name", {
                            required: <div dangerouslySetInnerHTML={{ __html: t('MISC.required_field') }} />,
                            minLength: { value: 3, message: "Nome deve ter pelo menos 3 caracteres" },
                            maxLength: { value: 100, message: "Nome não pode exceder 100 caracteres" }
                        })}
                        onChange={(e) => setValue("name", e.target.value)}
                        error={errors.name?.message}
                    />

                    <fieldset>
                        <legend>{t('DIRECTORIES_PAGE.ADD.show_in_observatory')} *</legend>
                        <RadioGroup
                            darkTheme={theme}
                            data={[
                                { id: 'yes', name: "Sim" },
                                { id: 'no', name: "Não" }
                            ]}
                            inline
                            onChange={handleShowInObservatoryChange}
                            value={showInObservatory}
                            name="show_in_observatory"
                        />
                    </fieldset>

                    <fieldset>
                        <legend>{t('DIRECTORIES_PAGE.ADD.choose_format')} *</legend>
                        <RadioGroup
                            darkTheme={theme}
                            data={[
                                { id: 'INTERSECTION', name: t('DIRECTORIES_PAGE.ADD.intersection') },
                                { id: 'UNION', name: t('DIRECTORIES_PAGE.ADD.union') }
                            ]}
                            inline
                            onChange={handleFormatChange}
                            value={format}
                            name="format"
                        />
                    </fieldset>

                    <div>
                        <label>{t('DIRECTORIES_PAGE.ADD.select_categories')} *</label>
                        <MultiSelectTable
                            id="entities"
                            darkTheme={theme}
                            selected={tags || []}
                            onSelectedChange={handleEntitiesChange}
                            options={categories}
                            onInputChange={handleCategoryInputChange}
                            isLoading={isCategoriesLoading}
                            placeholder="Pesquise e selecione categorias..."
                            noOptionsMessage={() => "Nenhuma categoria encontrada"}
                            loadingMessage={() => "A pesquisar..."}
                            columnLabel="Categoria"
                            tableCaption="Categorias selecionadas"
                            emptyMessage="Nenhuma categoria selecionada."
                        />
                        {(tags || []).length === 0 && (
                            <div className="text-danger mt-1">Pelo menos uma categoria deve ser selecionada</div>
                        )}
                    </div>

                    <div className="d-flex justify-content-start">
                        <Button
                            type="submit"
                            darkTheme={theme}
                            text={isSubmitting
                                ? (id ? "A atualizar..." : "A guardar...")
                                : (id ? "Atualizar e Sair" : t('ADMIN_CONSOLE.save_and_exit'))
                            }
                            disabled={isSubmitting || !watchedName || (tags || []).length === 0}
                        />
                        <Button
                            type="button"
                            className="ms-3"
                            darkTheme={theme}
                            text="Sair"
                            variant="danger"
                            onClick={() => navigate('/dashboard/directories')}
                        />
                    </div>
                </div>
            </form>

            <Modal
                isOpen={showFeedbackModal}
                onRequestClose={() => setShowFeedbackModal(false)}
                title={id ? "Editar Diretório" : "Criar Diretório"}
            >
                <p>{feedbackMessage}</p>
                <Button
                    darkTheme={theme}
                    text="OK"
                    className="btn-primary"
                    onClick={() => setShowFeedbackModal(false)}
                />
            </Modal>
        </div>
    );
};

export default DirectoriesCreateForm;
