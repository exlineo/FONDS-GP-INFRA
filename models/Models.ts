export interface CollectionI {
    titre:string;
    alias:string;
    description:string;
    date:string;
    type:string;
    createur:string;
    fonds:string;
    langue:string;
    notices:Array<any>;
    series:Array<any>;
}

export interface NoticeI {
    date:string;
    prefix:string;
    metadonnees:Array<any>;
}

export interface SetI {
    titre:string;
    alias:string;
    description:string;
    date:string;
    createur:string;
    fonds:string;
    gestionnaire:string;
    documents:string;
    prefix:Array<any>;
}

export interface PrefixI {
    alias:string;
    titre:string;
}

export interface CompteI {
    nom:string;
    compte:string;
    mdp:string;
    description:string;
    email:string;
    statut:number;
}
export interface SearchI {
    collection:string;
    libre:Array<string>;
}