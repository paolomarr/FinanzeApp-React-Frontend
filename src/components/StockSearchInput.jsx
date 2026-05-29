import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import { t, Trans } from "@lingui/macro";
import searchStocks from "../queries/searchStocks";

const DEBOUNCE_MS = 300;

const StockSearchInput = ({ value, onChange, existingStocks, disabled, isInvalid }) => {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
        return () => clearTimeout(handle);
    }, [query]);

    // staleTime is short here (unlike the rest of the app's infinite-cache
    // convention) because search results from the upstream provider are volatile.
    const { data: results, isFetching } = useQuery({
        queryKey: ["stockSearch", debouncedQuery],
        queryFn: searchStocks,
        enabled: !disabled && debouncedQuery.trim().length >= 2,
        staleTime: 30_000,
        retry: false,
    });

    // Edit mode: value is an existing stock id. Resolve to a display label.
    if (disabled) {
        let label = "";
        if (value && typeof value === "object") {
            label = `${value.symbol} - ${value.name}`;
        } else if (value && existingStocks) {
            const stock = existingStocks.find((s) => s.id === Number(value));
            if (stock) label = `${stock.symbol} - ${stock.name}`;
        }
        return (
            <>
                <Form.Control type="text" value={label} disabled readOnly />
                <Form.Text className="text-muted small">
                    <Trans>Stock cannot be changed on an existing order</Trans>
                </Form.Text>
            </>
        );
    }

    const selectedLabel = value && typeof value === "object"
        ? `${value.symbol} - ${value.name}`
        : "";

    const handlePick = (item) => {
        onChange(item);
        setQuery("");
        setDebouncedQuery("");
        setOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setQuery("");
        setDebouncedQuery("");
        setOpen(true);
    };

    return (
        <div style={{ position: "relative" }}>
            {value ? (
                <div className="d-flex align-items-center">
                    <Form.Control type="text" value={selectedLabel} readOnly className={isInvalid ? "is-invalid" : ""} />
                    <button type="button" className="btn btn-link btn-sm ms-1" onClick={handleClear}>
                        <Trans>Change</Trans>
                    </button>
                </div>
            ) : (
                <Form.Control
                    type="search"
                    placeholder={t`Type a symbol or company name`}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    className={isInvalid ? "is-invalid" : ""}
                />
            )}
            {open && !value && debouncedQuery.trim().length >= 2 && (
                <ListGroup
                    style={{
                        position: "absolute", top: "100%", left: 0, right: 0,
                        zIndex: 1000, maxHeight: "240px", overflowY: "auto",
                    }}
                    className="shadow"
                >
                    {isFetching && (
                        <ListGroup.Item className="text-center text-muted small">
                            <Spinner animation="border" size="sm" />{" "}<Trans>Searching…</Trans>
                        </ListGroup.Item>
                    )}
                    {!isFetching && results && results.length === 0 && (
                        <ListGroup.Item className="text-center text-muted small">
                            <Trans>No matches</Trans>
                        </ListGroup.Item>
                    )}
                    {!isFetching && results && results.map((r) => (
                        <ListGroup.Item
                            key={`${r.symbol}-${r.market}`}
                            action
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handlePick(r)}
                        >
                            <div className="d-flex align-items-baseline">
                                <span className="fw-bold pe-2">{r.symbol}</span>
                                <span className="small text-secondary">{r.market}</span>
                                {r.currency ? <span className="small text-secondary ms-2">{r.currency}</span> : null}
                            </div>
                            <div className="small">{r.name}</div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default StockSearchInput;
