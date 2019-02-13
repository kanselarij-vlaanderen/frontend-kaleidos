import { helper } from '@ember/component/helper';

/**
 * This helper will determine if an agendaitem is deleteable or not.
 * @param [*] params
 * @param [agendaitem:{},lastDefiniteAgenda:{}] items ()
 */
export async function allowDeleteAgendaitem(params, items) {
  let agendaitem = items.agendaitem;
  let lastDefiniteAgenda = await items.lastDefiniteAgenda;
  if(!lastDefiniteAgenda) return true;
  let agendaitems = await lastDefiniteAgenda.get('agendaitems');
  let agendaitemNotInDefiniteAgenda = true;
  
  await agendaitems.map(item => { 
    if(agendaitem.get('subcase.id') == item.get('subcase').get('id')) {
      agendaitemNotInDefiniteAgenda = false;
    }
    return item;
  });
  
  return agendaitemNotInDefiniteAgenda;
}

export default helper(allowDeleteAgendaitem);
