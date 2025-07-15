import React from 'react';
import { Input, Button, Breadcrumb, Select } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
const CategoriesCreateForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { t } = useTranslation();
    const { theme } = useTheme();
    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };

    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },

        {
            title: t('CATEGORIES_PAGE.ADD.title'),
        }
    ];
    return (
        <div>
            <Breadcrumb data={breadcrumbs} />

            <h1>{t('CATEGORIES_PAGE.ADD.title')}</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
            <p>{t('CATEGORIES_PAGE.ADD.description_category')}</p>
            <p>{t('CATEGORIES_PAGE.ADD.note')}</p>
                <div className='w-50 d-flex flex-column gap-4'>
            <h2>Nova Categoria</h2>
                    <Input
                        id="categoryName"
                        label={t('CATEGORIES_PAGE.ADD.name_label')}
                        name="categoryName"
                        type="text"
                        darkTheme={theme}
                        {...register("categoryName", { required: true })}
                        error={errors.categoryName ? "Campo obrigatório" : undefined}
                    />

                    <Select
                        id="directories"
                        darkTheme={theme}
                        label={t('CATEGORIES_PAGE.ADD.directories_label') + ` ${t('HEADER.optional')}`}
                        name="directories"
                        {...register("entities", { required: true })}
                        error={errors.entities ? "Campo obrigatório" : undefined}
                        options={[
                            { value: "1", label: "Directorio 1" },
                            { value: "2", label: "Directorio 2" },
                            { value: "3", label: "Directorio 3" },
                            { value: "4", label: "Directorio 4" },
                        ]}
                    >
                    </Select>

                    <Select
                        id="websites"
                        darkTheme={theme}
                        label={`${t('CATEGORIES_PAGE.ADD.websites_label')} ${t('HEADER.optional')}`}
                        name="websites"
                        {...register("entities", { required: true })}
                        error={errors.entities ? "Campo obrigatório" : undefined}
                        options={[
                            { value: "1", label: "Sítio Web 1" },
                            { value: "2", label: "Sítio Web 2" },
                            { value: "3", label: "Sítio Web 3" },
                            { value: "4", label: "Sítio Web 4" },
                        ]}
                    >
                    </Select>

                    <div className="d-flex justify-content-start">
                        <Button
                            darkTheme={theme}
                            type="submit"
                            text={t('ADMIN_CONSOLE.save_and_exit')}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
export default CategoriesCreateForm;