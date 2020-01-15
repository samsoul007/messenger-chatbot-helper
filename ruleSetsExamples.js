const M = require('./index.js');
const RT = M.responseTypes;

const menu = {
  main() {
    return RT.quickReplyGroup("Menu:", [RT.quickReply("menu1", "value1", "https://picsum.photos/300/300"), RT.quickReply("menu2", "value2", "https://picsum.photos/300/300")], "main_menu")
  },
  sub_menu() {
    return RT.quickReplyGroup("Please choose:", [RT.quickReply("sub_menu1", "sub_value1", "https://picsum.photos/300/300"), RT.quickReply("sub_menu2", "sub_value2", "https://picsum.photos/300/300")], "sub_menu")
  }
}

M.createRule("thank you")
  .exclusive()
  .if()
  .hasThanks()
  .then()
  .setText("You are welcome. Anything else I can help you with?")

M.createRule("hello")
  .exclusive()
  .if()
  .hasGreetings()
  .then()
  .setText("Hello there, what I can help you with?")
  .custom((event, RT) => menu.main())

M.createRule("help")
  .exclusive()
  .if()
  .hasText("help")
  .then()
  .setText("You can ask a question such as 'find something'")
  .custom((event, RT) => menu.main())

M.createRule("menu")
  .exclusive()
  .if()
  .hasText("menu")
  .then()
  .custom((event, RT) => menu.main())

M.createRule("find")
  .exclusive()
  .if()
  .hasText("find")
  .then()
  .custom((event, RT, eventData) => {
    // this is a custom rule.
    // Works as a promise and has to resolve or reject
    // Needs to return a ReturnType (RT)
    //evenData contains all the parsed information of the event such as NLPs, text, etc. for further processing

    const arroButtons = [
      RT.button("Google", "https://google.com"),
      RT.button("Bing", "https://bing.com")
    ]

    return RT.buttonGroup("Search engines:", arroButtons)
  })

M.createRule("sub menu level")
  .exclusive()
  .if()
  .hasContext("main_menu")
  .then()
  .custom((event, RT, eventData) => {
    //payload from other menu
    eventData.payload;

    //Return sub menu
    return menu.sub_menu();
  });

M.createRule("sub menu choice")
  .exclusive()
  .if()
  .hasContext("sub_menu")
  .then()
  .custom((event, RT, eventData) => {
    return RT.message(`you have selected ${eventData.payload}`);
  });

//This rule will be executed if no others are active
M.createRule("other")
  .then()
  .setText("Sorry I didn't understand your request.")
  .setText("You can ask a question such as 'find' or 'menu'")
  .custom((event, RT) => menu.main())
