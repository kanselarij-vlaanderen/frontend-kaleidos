import { helper } from '@ember/component/helper';

/**
 * This helper will determine if an agendaitem is deleteable or not.
 * @param [*] params
 * @param [agendaitem:{},lastDefiniteAgenda:{}] items ()
 */
export async function allowDeleteAgendaitem(params, items) {
  const agendaitem = await items.agendaitem;
  const lastDefiniteAgenda = await items.lastDefiniteAgenda;
  if(!lastDefiniteAgenda) {
    return true;
  } 
  const agendaitems = await lastDefiniteAgenda.get('agendaitems');
  let agendaitemNotInDefiniteAgenda = true;

  const agendaitemSubcase = await agendaitem.get('subcase');

  await Promise.all(agendaitems.map(item => { 
    return item.get('subcase').then((subcase) => {
      if(!subcase || !agendaitemSubcase) {
        return;
      }
      if(agendaitemSubcase.id == subcase.id) {
        agendaitemNotInDefiniteAgenda = false;
      }
    })
  }));
  
  return agendaitemNotInDefiniteAgenda;
}

export default helper(allowDeleteAgendaitem);
