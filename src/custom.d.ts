// pour TypeScript au niveau de molécule. Cela signifie que tous les imports qui finissent par .css existent et que leur contenu est un objet mapping className → string
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}