import React from "react";

import { WikiSearchResult } from "../../pages/Search/Search";

type Result = {
  result: WikiSearchResult;
};

const SearchResult = ({ result }: Result) => {
  const [query, search, summaries, links] = result;
  return (
    <div className="mt-4">
      {query && <h3>Search results for "{query}"</h3>}
      <ul className="list-group">
        {search?.map((name, index) => (
          <li key={`${name}-${search}`} className="list-group-item">
            <a href={links[index]} rel="noreferrer" target="_blank">
              <h4>{name}</h4>
            </a>
            <p>{summaries[index]}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResult;
