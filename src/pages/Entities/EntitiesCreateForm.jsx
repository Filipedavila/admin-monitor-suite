import React from 'react';
import { Input, Button, Breadcrumb, Select } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
const EntitiesCreateForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { t } = useTranslation();
    const { theme } = useTheme();
    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };

    const breadcrumbs = [
        { children: <Link to="/">Início</Link> },
        {
            title: "Criar Entidade",
        }
    ];

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{t('ENTITIES_PAGE.ADD.title')}</h1>
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                <p>{t('ENTITIES_PAGE.ADD.description_entity')}</p>
                <div className='w-50 d-flex flex-column gap-3'>
                    <h2>Nova Entidade</h2>
                    <Input
                        id="entityName"
                        label={t('ENTITIES_PAGE.ADD.short_name_label')}
                        name="entityName"
                        type="text"
                        darkTheme={theme}
                        {...register("entityName", { required: true })}
                        error={errors.entityName ? t('MISC.required_field') : undefined}
                    />

                    <Input
                        id="fullName"
                        label={t('ENTITIES_PAGE.ADD.long_name_label')  + ` ${t('HEADER.optional')}`}
                        name="fullName"
                        type="text"
                        darkTheme={theme}
                        {...register("fullName", { required: true })}
                        error={errors.fullName ? t('MISC.required_field') : undefined}
                    />

                    <Select
                        id="websites"
                        darkTheme={theme}
                        label={t('CATEGORIES_PAGE.ADD.websites_label')  + ` ${t('HEADER.optional')}`}
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
export default EntitiesCreateForm;