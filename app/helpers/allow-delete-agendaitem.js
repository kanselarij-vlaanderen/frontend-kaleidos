import { helper } from '@ember/component/helper';

/**
 * This helper will determine if an agendaitem is deleteable or not.
 * @param [*] params
 * @param [agendaitem:{},lastDefiniteAgenda:{}] items ()
 */
export async function allowDeleteAgendaitem(params, items) {
  let agendaitem = items.agendaitem;
  let lastDefiniteAgenda = items.lastDefiniteAgenda;
  let agendaitems = await lastDefiniteAgenda.get('agendaitems');
  let agendaitemNotInDefiniteAgenda = true;

  await agendaitems.map(item => {
    if(agendaitem.get('subcase').get('id') === item.get('subcase').get('id')) {
      agendaitemNotInDefiniteAgenda = false;
    }
    return item;
  });
  
  return agendaitemNotInDefiniteAgenda;
}

export default helper(allowDeleteAgendaitem);
