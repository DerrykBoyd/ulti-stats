import React, { useMemo } from 'react'
import { useTable, useSortBy } from 'react-table';

import '../styles/StatTable.css';

export default function StatTable(props) {

  const columns = useMemo(() => [
    { Header: '##', accessor: 'number' },
    { Header: 'First Name', accessor: 'firstName' },
    { Header: 'Last Name', accessor: 'lastName' },
    { Header: 'Point', accessor: 'point', sortDescFirst: true },
    { Header: 'Assist', accessor: 'assist', sortDescFirst: true },
    { Header: 'Touch', accessor: 'touch', sortDescFirst: true },
    { Header: 'D Play', accessor: 'dPlay', sortDescFirst: true },
    { Header: 'T Away', accessor: 'throwAway', sortDescFirst: true },
    { Header: 'Drop', accessor: 'drop', sortDescFirst: true },
    { Header: 'Points Played', accessor: 'pointsPlayed.length', sortDescFirst: true },
  ], [])

  const data = useMemo(() => props.stats, [props.stats])

  const { getTableProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  )

  return (
    <>
      <div className='stat-table' {...getTableProps()}>
        {headerGroups.map(headerGroup => (
          headerGroup.headers.map((column, x) => (
            // Add the sorting props to control sorting. For this example
            // we can add them into the header props
            <div className={`st-header ${x === 1 ? 'first-name' : ''}`} {...column.getHeaderProps(column.getSortByToggleProps())}>
              {column.render('Header')}
              {/* Add a sort direction indicator */}
              <span>
                {column.isSorted
                  ? column.isSortedDesc
                    ? <i className="material-icons md-18">arrow_drop_down</i>
                    : <i className="material-icons md-18">arrow_drop_up</i>
                  : ''}
              </span>
            </div>
          ))
        ))}
        {rows.map(
          (row, y) => {
            prepareRow(row);
            return (
              row.cells.map((cell, x) => {
                return (
                  <div className={`row ${y % 2 ? 'row-odd' : 'row-even'} col-${x} ${x === 1 ? 'first-name' : ''}`} {...cell.getCellProps()}>{cell.render('Cell')}</div>
                )
              })
            )
          }
        )}
      </div>
    </>
  )
}
