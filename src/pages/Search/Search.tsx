import React, { useState } from "react";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as RD from "remote-data-ts";
import axios from "axios";
import SearchResult from "../../components/SearchResult/SearchResult";
import LoadingIndicator from "../../components/LoadingIndicator/LoadingIndicator";

export type WikiSearchResult = [string, string[], string[], string[]];

const BASE_URL =
  "https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search=";

const Search = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<RD.RemoteData<Error, WikiSearchResult>>(
    RD.notAsked
  );

  const getOption = O.fromPredicate(
    (str: string) => !S.Eq.equals(pipe(str, S.trim), "")
  );

  const getUrl = (query: string): string => {
    return `${BASE_URL}${query}`;
  };

  const fetchSearchResult = (url: string) => {
    return TE.tryCatch<Error, WikiSearchResult>(
      () => axios.get(url).then((res) => res.data),
      (reason) => new Error(String(reason))
    )();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    pipe(
      value,
      getOption,
      O.fold(
        () => setResult(RD.notAsked),
        (query) => searchWikipedia(query)
      )
    );
  };

  const searchWikipedia = (query: string) => {
    setResult(RD.loading);
    const url = pipe(query, getUrl);
    fetchSearchResult(url)
      .then((response) =>
        pipe(
          response,
          E.getOrElse<Error, WikiSearchResult>(
            () => [] as unknown as WikiSearchResult
          )
        )
      )
      .then((data) => setResult(RD.success(data)))
      .catch((err: Error) => setResult(RD.failure(err)));
  };

  return (
    <div className="container-sm">
      <h1 className="mt-4">Wikipedia Search API</h1>
      <input
        type="text"
        value={query}
        className="form-control w-50 sm:w-75"
        placeholder="Type something..."
        onChange={handleChange}
      />
      {pipe(
        result,
        RD.match({
          notAsked: () => null,
          loading: () => <LoadingIndicator />,
          success: (resultData) => <SearchResult result={resultData} />,
          failure: (err) => (
            <div className="alert alert-warning mt-4" role="alert">
              <h4 className="alert-heading">Error!</h4>
              <p>{err.message}</p>
            </div>
          ),
        })
      )}
    </div>
  );
};

export default Search;
