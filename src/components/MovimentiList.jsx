import { Table } from "reactstrap";
import { useQuery } from "@tanstack/react-query";
import fetchMovements from "../queries/fetchMovements";
import { Navigate } from "react-router-dom";

function MovimentiListTableHeader({fields}) {
    return (
      <thead>
        <tr>
          {fields.map((field) => (
            <th key={`movementTableHeader_${field.column}`}>{field.name}</th>
          ))}
        </tr>
      </thead>
    );
}

const MovimentiListItem = ({movement, fields}) => {
    return (
        <tr key={movement.id}>
        {fields.map((field) => {
            if(field.format !== undefined){
                const val = field.format(movement[field.column]);
                const key = `${field.column}_${val.id}`;
                return <td key={key}>{val}</td>;
            }else{
                const key = `${field.column}_${movement.id}`;
                const val = movement[field.column];
                return <td key={key}>{val}</td>;
            }
        })}
        </tr>
    )
};

const MovimentiList = () => {
    const results = useQuery(["movements"], fetchMovements);
    const movements = results?.data;
    const fields = [
        {column:"id", name: "id"},
        {column:"category", name: "Category", format: (item) => {return item.category}},
        // {column:"user", name: "User"},
        {column:"date", name: "Date", format: (date) => {return new Date(date).toLocaleDateString()}},
        {column:"description", name: "Description"},
        {column:"abs_amount", name: "Abs. amount"},
        {column:"subcategory", name: "Subcategory"},
    ]
    
    if (results.isLoading) {
      return (
        <div className="loading-pane">
          <h2 className="loader">🌀</h2>
        </div>
      );
    }
    if (results.isError) {
        switch (results.error.message) {
            case "forbidden":
                console.log("Unable to fetch: unauthenticated");
                return (
                    <Navigate to="/login" />
                )
            default:
                console.log("Unable to fetch: unknown error");
                break;
        }
    }
    return (
      <Table>
        <MovimentiListTableHeader fields={fields} />
        <tbody>
          {!movements || movements.length <= 0 ? (
            <tr>
              <td colSpan="6" align="center">
                <b>Ops, no one here yet</b>
              </td>
            </tr>
          ) : (
            movements.map((movement) => (
              <MovimentiListItem movement={movement} fields={fields} />
            ))
          )}
        </tbody>
      </Table>
    );
}

export default MovimentiList