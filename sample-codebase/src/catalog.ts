export type Product = {
    sku: string;
    title: string;
    tags: string[];
    active: boolean;
};

export interface ProductQuery {
    searchTerm?: string;
    requiredTag?: string;
    activeOnly?: boolean;
}

const products: Product[] = [
    { sku: "sku-1", title: "Blue Keyboard", tags: ["accessory", "keyboard"], active: true },
    { sku: "sku-2", title: "Wireless Mouse", tags: ["accessory", "mouse"], active: true },
    { sku: "sku-3", title: "Legacy Dock", tags: ["docking"], active: false },
];

export class CatalogService {
    findProducts(query: ProductQuery): Product[] {
        return products.filter((product) => {
            if (query.activeOnly && !product.active) {
                return false;
            }

            if (query.requiredTag && !product.tags.includes(query.requiredTag)) {
                return false;
            }

            if (query.searchTerm) {
                const lowered = query.searchTerm.toLowerCase();
                return product.title.toLowerCase().includes(lowered) || product.sku.toLowerCase().includes(lowered);
            }

            return true;
        });
    }
}
