import type { DataSourceType } from "./types";
import folderTree from "./folderTree.json";
import dataSource from "./dataSource.json";

/**
 * Recherche récursive dans un arbre JSON
 */
function searchTree(node: any, query: string, result: any[]) {
    if (!node) return;
    const target = node.name || "";
    if (target.includes(query) || query.includes(target)) {
        console.log("[search] match trouvé:", target);
        result.push(node);
    }
    if (node.children) {
        node.children.forEach((item: any) => searchTree(item, query, result));
    }
}

const api = {
    getFolderTree() {
        console.log("[api] getFolderTree →", folderTree);
        return folderTree;
    },

    search(value: string) {
        console.log("[api] search value:", value);
        const result: any[] = [];
        searchTree(folderTree, value, result);
        console.log("[api] search result:", result);
        return result;
    },

    getDataSource() {
        console.log("[api] getDataSource →", dataSource);
        return dataSource;
    },

    getDataSourceById(sourceId: string): Promise<DataSourceType> {
        console.log("[api] getDataSourceById id:", sourceId);
        return new Promise<DataSourceType>((resolve) => {
            const mockDataSource: DataSourceType = {
                id: sourceId,
                name: `dataSource${sourceId}`,
                type: "MySQL",
                jdbcUrl: "http://jdbc:127.0.0.1//3306",
                updateTime: Date.now() + "",
            };
            console.log("[api] getDataSourceById mock →", mockDataSource);
            resolve(mockDataSource);
        });
    },

    createDataSource(dataSource: Omit<DataSourceType, "id">) {
        console.log("[api] createDataSource input:", dataSource);
        const response = {
            code: 200,
            message: "success",
            data: dataSource,
        };
        console.log("[api] createDataSource response:", response);
        return Promise.resolve(response);
    },

    async query(query: string = "") {
        console.log("[api] query value:", query);
        const result: any[] = [];
        searchTree(folderTree, query, result);
        console.log("[api] query result:", result);
        return result;
    },
};

export default api;
