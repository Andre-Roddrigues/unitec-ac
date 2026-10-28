/**
 * Lista de desejos desligada temporariamente: esconde o coração do
 * `CourseCard` da home e o separador "Lista de desejos" do perfil. São os
 * dois juntos — o coração era o único sítio onde se guardava um curso, e um
 * separador sem forma de o encher pedia ao aluno algo impossível. Para
 * reactivar, basta voltar a pôr `true`.
 *
 * Fica aqui e não em `hooks/use-wishlist.ts` porque esse módulo é
 * `"use client"`: importado no `CourseCard` (server component), a constante
 * chegaria como referência de cliente — um objecto, sempre verdadeiro.
 */
export const WISHLIST_ENABLED = false;
