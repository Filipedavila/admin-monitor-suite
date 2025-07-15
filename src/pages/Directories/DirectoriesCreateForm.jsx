import React from 'react';
import { Input, Button, CheckGroup, RadioGroup, Breadcrumb, Select } from 'ama-design-system';
import { useForm } from "react-hook-form";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
const DirectoriesCreateForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { t } = useTranslation();
    const { theme } = useTheme();
    const breadcrumbs = [
        { children: <Link to="/dashboard/global">Global</Link> },

        {
            title: t('DIRECTORIES_PAGE.ADD.title'),
        }
    ];
    const onSubmit = (data) => {
        console.log("User data:", data);
        // Add user creation logic here
    };

    return (
        <div>
            <Breadcrumb data={breadcrumbs} />

            <h1>{t('DIRECTORIES_PAGE.ADD.title')}</h1>
           
            <form className="bg-white p-4 mt-3" onSubmit={handleSubmit(onSubmit)}>
                 <p>Um Diretório é um agregador de sítios web. Os Diretórios têm por objetivo publicar sítios web publicamente no Observatório. Os Diretórios são construídos com base nas Categorias/tags que se encontram agarradas aos sítios web.</p>
            <p>Os Diretórios podem ser construídos:</p>
            <ul>
                <li>por interseção das Categorias. A interseção é uma operação entre conjuntos que resulta em um novo conjunto formado por todos os elementos que são comuns a dois ou mais conjuntos originais.</li>
                <li>por reunião das Categorias. A reunião, ou união, de conjuntos refere-se à combinação de todos os elementos de dois ou mais conjuntos.</li>
            </ul>
                <div className='w-50 d-flex flex-column gap-3'>
                    <Input
                        id="name"
                        label={t('DIRECTORIES_PAGE.ADD.name_label')}
                        name="name"
                        darkTheme={theme}
                        type="text"
                        {...register("name", { required: true })}
                        error={errors.name ? "Campo obrigatório" : undefined}
                    />

                    <fieldset>
                        <label>{t('DIRECTORIES_PAGE.ADD.show_in_observatory')}</label>
                        <RadioGroup
                            darkTheme={theme}
                            data={[
                                {
                                    id: 'yes',
                                    name: "Sim"
                                },
                                {
                                    id: 'no',
                                    name: "Não"
                                }
                            ]}
                            inline
                            onChange={() => { }}
                            value="1"
                            name="show_in_observatory"
                        />
                    </fieldset>

                    <fieldset>
                        <label>{t('DIRECTORIES_PAGE.ADD.choose_format')}</label>
                        <RadioGroup
                            darkTheme={theme}
                            data={[
                                {
                                    id: 'id_intersection',
                                    name: t('DIRECTORIES_PAGE.ADD.intersection')
                                },
                                {
                                    id: 'id_union',
                                    name: t('DIRECTORIES_PAGE.ADD.union')
                                }
                            ]}
                            inline
                            onChange={() => { }}
                            value="1"
                            name="format"
                        />
                    </fieldset>

                    <Select
                        id="entities"
                        darkTheme={theme}
                        label={t('DIRECTORIES_PAGE.ADD.select_categories')}
                        name="entities"
                        {...register("entities", { required: true })}
                        error={errors.entities ? "Campo obrigatório" : undefined}
                        options={[
                            { value: "1", label: "Categoria 1" },
                            { value: "2", label: "Categoria 2" },
                            { value: "3", label: "Categoria 3" },
                            { value: "4", label: "Categoria 4" },
                        ]}
                    >
                    </Select>


                    <div className="d-flex justify-content-start">
                        <Button
                            type="submit"
                            darkTheme={theme}
                            text={t('ADMIN_CONSOLE.save_and_exit')}

                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
export default DirectoriesCreateForm;