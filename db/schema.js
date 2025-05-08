const QUOTE_TABLE = {
    ID: 'id',
    QUOTE: 'quote',
    AUTHOR: 'author'
};

const TAGS_TABLE = {
    ID: 'id',
    NAME: 'name'
};

const QUOTE_TAGS_TABLE = {
    QUOTE_ID: 'quote_id',
    TAG_ID: 'tag_id'
};

const TAG_SYNONYMS_TABLE = {
    VARIANT: 'variant',
    CANONICAL: 'canonical'
};

const FAVOURITES_TABLE = {
    ID: 'id',
    QUOTE: 'quote',
    AUTHOR: 'author',
    TAGS: 'tags',
    CREATED_AT: 'created_at'
};

const TABLES = {
    quotes: QUOTE_TABLE,
    tags: TAGS_TABLE,
    quote_tags: QUOTE_TAGS_TABLE,
    tag_synonyms: TAG_SYNONYMS_TABLE,
    favourites: FAVOURITES_TABLE
};

module.exports = {
    TABLES
};
