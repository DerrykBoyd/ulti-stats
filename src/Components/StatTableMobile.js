import React, { useMemo } from 'react'
import { useTable, useSortBy } from 'react-table';

export default function StatTable(props) {

  const columns = useMemo(() => [
    { Header: '##', accessor: 'number' },
    { Header: 'Last Name', accessor: 'lastName' },
    { Header: 'Point', accessor: 'point', sortDescFirst: true },
    { Header: 'Assist', accessor: 'assist', sortDescFirst: true },
    { Header: 'Touch', accessor: 'touch', sortDescFirst: true },
    { Header: 'D Play', accessor: 'dPlay', sortDescFirst: true },
    { Header: 'T Away', accessor: 'throwAway', sortDescFirst: true },
    { Header: 'Drop', accessor: 'drop', sortDescFirst: true },
  ], [])

  const data = useMemo(() => props.stats, [props.stats])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  )

  return (
    <>
      <table className='stat-table' {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                // Add the sorting props to control sorting. For this example
                // we can add them into the header props
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  {/* Add a sort direction indicator */}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? <i className="material-icons md-18">arrow_drop_down</i>
                        : <i className="material-icons md-18">arrow_drop_up</i>
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(
            (row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    )
                  })}
                </tr>
              )
            }
          )}
        </tbody>
      </table>
    </>
  )
}
