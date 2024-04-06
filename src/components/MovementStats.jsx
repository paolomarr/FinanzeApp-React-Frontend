import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, Cell } from 'recharts';
import { Row, Col } from 'reactstrap';
import { useMediaQuery } from 'react-responsive'
import { t } from "@lingui/macro";
import { colors } from '../constants';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    let valString = `${parseFloat(payload[0].payload.sum).toFixed(2)}`;
    if(payload[0].payload.percent){
      valString += ` (${parseFloat(payload[0].value).toFixed(1)}%)`;
    }
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        <p>{valString}</p>
      </div>
    );
  }

  return null;
};

const MovementsStats = ({data, slice, categories}) => {
    const percent_cutin = 0.02;
    let earningData = {
      earnings: [],
    };
    let expensesData = {
      expenses: [],
    };
    let totalsData = [];
    let incomes = 0;
    let outcomes = 0;
    let statsCategories = {};
    if(data) {
      let outliers = {
        incomes: {category: t`Other in.` + ` (<${100*percent_cutin}%)`, sum: 0, percent: 0, direction: 1},
        outcomes: {category: t`Other out.` + ` (<${100*percent_cutin}%)`, sum: 0, percent: 0, direction: -1},
      }
      for (const movement of data.movements) {
        if(slice){
          const mDate = new Date(movement.date);
          if(mDate < slice.minDate || mDate > slice.maxDate){
            continue;
          }
        }
        if(movement.amount>0){   
          incomes += movement.abs_amount;
        }else {
          outcomes += movement.abs_amount;
        }
        const cat = categories.find((cat)=> cat.id === movement.category);
        if(cat){
          if(cat.category in statsCategories){
            statsCategories[cat.category].sum += movement.abs_amount
          }else{
            statsCategories[cat.category] = {...cat, "sum": movement.abs_amount};
          }
        }
      }
      for (const catName in statsCategories) {
        const cat = statsCategories[catName];
        let percent = 0.;
        if(cat.direction === 1) {
          percent = cat.sum/incomes;
          const newitem = {...cat, "percent": percent};
          if(percent>=percent_cutin){
            earningData.earnings.push(newitem);
          }else{
            outliers.incomes.sum += newitem.sum;
            outliers.incomes.percent += newitem.sum;
          }
        }else{
          percent = cat.sum/outcomes;
          const newitem = {...cat, "percent": percent};
          if(percent>=percent_cutin){
            expensesData.expenses.push(newitem)
          }else{
            outliers.outcomes.sum += newitem.sum;
            outliers.outcomes.percent += newitem.percent;
          }
        }
      }
      earningData.earnings.sort((a,b)=> b.sum - a.sum); // reverse sorted
      if(outliers.incomes.sum > 0){
        earningData.earnings.push(outliers.incomes)
      }
      expensesData.expenses.sort((a,b)=> b.sum - a.sum); // reverse sorted
      if(outliers.outcomes.sum > 0){
        expensesData.expenses.push(outliers.outcomes);
      }
    }
    totalsData = [{direction: 1, category: t`Earnings`, sum: incomes}, {direction: -1, category: t`Expenses`, sum: outcomes}];


    // if(data) {
    //   totalsData = [{direction: 1, category: t`Earnings`, sum: data.incomes}, {direction: -1, category: t`Expenses`, sum: data.outcomes}];
    //   let outliers = {
    //     incomes: {category: t`Other in.` + ` (<${100*percent_cutin}%)`, sum: 0, percent: 0, direction: 1},
    //     outcomes: {category: t`Other out.` + ` (<${100*percent_cutin}%)`, sum: 0, percent: 0, direction: -1},
    //   }

    //   for (const catName in data.categories) {
    //     const cat = data.categories[catName];
    //     let percent = 0.;
    //     if(cat.direction === 1) {
    //       percent = cat.sum/data.incomes;
    //       const newitem = {...cat, "percent": percent};
    //       if(percent>=percent_cutin){
    //         earningData.earnings.push(newitem);
    //       }else{
    //         outliers.incomes.sum += newitem.sum;
    //         outliers.incomes.percent += newitem.sum;
    //       }
    //     }else{
    //       percent = cat.sum/data.outcomes;
    //       const newitem = {...cat, "percent": percent};
    //       if(percent>=percent_cutin){
    //         expensesData.expenses.push(newitem)
    //       }else{
    //         outliers.outcomes.sum += newitem.sum;
    //         outliers.outcomes.percent += newitem.percent;
    //       }
    //     }
    //   }
    //   earningData.earnings.sort((a,b)=> b.sum - a.sum); // reverse sorted
    //   if(outliers.incomes.sum > 0){
    //     earningData.earnings.push(outliers.incomes)
    //   }
    //   expensesData.expenses.sort((a,b)=> b.sum - a.sum); // reverse sorted
    //   if(outliers.outcomes.sum > 0){
    //     expensesData.expenses.push(outliers.outcomes);
    //   }
    // }
    const chart_colors = {
      "1": colors.primary,
      "-1": colors.error,
    }
    const isLargeScreen = useMediaQuery({minWidth: 960 });
    
    const ResponsiveBarChart = ({data, dataKey, title, label}) => {
      const defaultLabel = {value:"%", position:"insideTopLeft", offset: 10};
      if(label) {
        label = {...defaultLabel, ...label};
      }else{
        label = defaultLabel;
      }
      if(isLargeScreen){
        return (
          <>
            <ResponsiveContainer height={400} width={"90%"} >
              <BarChart data={data}
                margin={{top:20, left:0, right:0, bottom:0}}
                barCategoryGap={'10%'} >
                <YAxis type='number' label={label} />
                <XAxis type='category' dataKey="category" tick={false} />
                <Tooltip content={<CustomTooltip />}/>
                <Bar dataKey={dataKey}>
                  {
                    data.map((item, index) => (
                      <Cell key={`bar_${index}`} fill={item.direction === 1 ? chart_colors["1"]: chart_colors["-1"]} />
                    ))
                  }
                  <LabelList dataKey="category" position="center" textAnchor='center' width={400} fill='#666' angle={-90} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className='bar-chart-title'>{title}</div>
          </>
        )
      }else{
        const barSize = 30;
        const chartHeight = barSize * (data.length + 1);
        return (
          <>
            <div className='bar-chart-title'>{title}</div>
            <ResponsiveContainer height={chartHeight} width={"100%"} >
              <BarChart data={data}
                layout='vertical'
                margin={{top:0, left:0, right:0, bottom:0}}
                barCategoryGap={'10%'} >
                <XAxis type='number' label={label} />
                <YAxis type='category' dataKey="category" tick={false} hide={true} />
                <Tooltip content={<CustomTooltip />}/>
                <Bar dataKey={dataKey} barSize={barSize} >
                  {
                    data.map((item, index) => (
                      <Cell key={`bar_${index}`} fill={item.direction === 1 ? chart_colors["1"]: chart_colors["-1"]} />
                    ))
                  }
                  <LabelList dataKey="category" position="insideLeft" width={400} angle={0} fill='#666' />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )
      }
    };
    
    const nCategories = earningData.earnings.length + expensesData.expenses.length;
    const earningsChartWidth = Math.ceil(9 * earningData.earnings.length / nCategories);
    const expensedChartWidth = Math.floor(9 * expensesData.expenses.length / nCategories);
    return (
      <Row className='mb-2'>
        <Col xs="12" lg={earningsChartWidth}>
          <ResponsiveBarChart title={t`Earnings`} data={earningData.earnings}  dataKey={(item)=> 100*item.percent}/>
        </Col>
        <Col xs="12" lg={expensedChartWidth}>
          <ResponsiveBarChart title={t`Expenses`} data={expensesData.expenses} dataKey={(item)=> 100*item.percent}/>
        </Col>
        <Col xs="12" lg="3">
          <ResponsiveBarChart title={t`Totals`} label={{value: "€"}} data={totalsData} dataKey={"sum"}/>
        </Col>
      </Row>
    )
};

export default MovementsStats