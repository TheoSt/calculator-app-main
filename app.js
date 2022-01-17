let number_buttons = document.querySelectorAll("button[data-button]");
let operation_buttons = document.querySelectorAll("button[data-operation]");
let screen_display = document.querySelector("#screen-display");
let theme_selectors = document.querySelectorAll(".theme-selector");
let user_input = ""; //the input the user enters,we reset it if we click an operation
let display_text = ""; //the text that we display in the every screen 
let calculations = []; //all the numbers and the operations to calculate
let result = 0;
let have_result = false; //if we have a result
let division_by_zero = false;
let active_theme = 1;

//add the first theme in the root element
document.documentElement.classList.add("first-theme");

//listeners for the theme selector
theme_selectors.forEach(thm => {
    thm.addEventListener("click",function() {
        active_theme = this.dataset.theme;
        document.documentElement.removeAttribute("class");
        switch(active_theme) {
            case "1":
                document.documentElement.classList.add("first-theme");
                break;
            case "2":
                document.documentElement.classList.add("second-theme");
                break;
            case "3":
                document.documentElement.classList.add("third-theme");
                break;
            default:
                console.error("error in theme selection");
        }
    });
})

for(btn of number_buttons) {
    btn.addEventListener("click",function(e) {
        let data = this.dataset.button; //take the data from the button
        
        if(have_result) { //if we have result and put another number start a new operation
            reset();
            have_result = false;
            if(division_by_zero) {
                division_by_zero = false;
                result=0;
            } 
        }
    
        user_input+=data; //add to the user input the data we read
        display_text+=data; //same as above to display
        updateDisplay(display_text); //display
    });
}

//listeners for the operations
for(btn of operation_buttons) {
    btn.addEventListener("click",function() {
        let data=this.dataset.operation;
        //if we clicked an operation
        if(data==="+" || data==="-" || data==="x" || data==="/") {
            if(!division_by_zero) {
                if(user_input==="" && data==="-") {
                    //if we entered minus and we don't have any other number
                    //then it's a negative number (eg -2+1)
                    user_input+=data;
                    display_text = user_input;
                    updateDisplay(display_text);
                    return;
                }
                if(have_result) { 
                    //if we entered an operation but we already have a result
                    //then we reset the calculations
                    //eg (5+5=10 and 10+1=11)
                    have_result=false;
                    user_input = result;
                    calculations = [];
                    display_text=result+data;
                }
                else {
                    //just update the display text
                    display_text+=data;
                }
                //push to calculations the number after we convert it
                calculations.push(parseFloat(user_input));
                calculations.push(data); //push the operand
                user_input=""; //reset the user_input
                updateDisplay(display_text); //update Display
            }
        }
        if(data==="=") {
            if(have_result) return; //if we push equal after an operation don't do nothing
            calculations.push(parseFloat(user_input)); //push to calculations the last number
            result = calculate(calculations); //calculate the operation
            if(division_by_zero) {
                updateDisplay("Cannot divide by zero");
            }
            else {
                updateDisplay(result);
            }
             //update the display and have_result
            have_result = true;
            return;
        }
        if(data==="del") {
            if(!division_by_zero) {
                if(have_result) { //if we have result then we remove the operation but we keep the result
                    user_input= result;
                    display_text = user_input;
                }
                else { //just remove the last character of the display and reset user input
                    user_input="";
                    display_text = display_text.slice(0,-1);
                }
                
                updateDisplay(display_text);
            }
        }
        
        if(data==="reset") reset(); //reset everything
        
    });
}

function reset() {
    display_text="";
    result=0;
    user_input="";
    calculations = [];
    updateDisplay("0");
}

function updateDisplay(display) {
    screen_display.textContent = display;
}


function calculate(nums) {
    let temp = 0;
    let multiply_indices = [];
    let division_indices = [];
    let addition_indices = [];
    let subtraction_indices = [];

    //i created the calculator with two operations maximum
    //we have to find if we have two same operations or different
    //so first we find we have two multiplies,divisions,additions or subtractions
    for(let i=0; i<nums.length; i++) {
        if(nums[i]==="x") {
            multiply_indices.push(i);
        }
        else if(nums[i]==="/") {
            division_indices.push(i);
        }
        else if(nums[i]==="+") {
            addition_indices.push(i); 
        }
        else if(nums[i]==="-") {
            subtraction_indices.push(i);
        }
        else { 
            continue; 
        }
    }

    //then we check if we have one operation or if we have two same operations
    if((nums.length===3 && multiply_indices.length===1) || multiply_indices.length===2) {
        temp=1;
        for(let i=0; i<=nums.length; i+=2) {
                temp *= nums[i];
        }
    }
    else if((nums.length===3 && division_indices.length===1) || division_indices.length===2) {
        temp = nums[0];
        for(let i=2; i<nums.length; i+=2) {
            if(nums[i]===0) {
                division_by_zero = true;
                return null;
            }
            temp /= nums[i];
        }
    }
    else if((nums.length===3 && addition_indices.length===1) || addition_indices.length===2) 
    {

        for(let i=0; i<nums.length; i+=2) {
            temp += nums[i];
        }
    }
    else if((nums.length===3 && subtraction_indices.length===1) || subtraction_indices.length===2) {
        temp = nums[0];
        for(let i=2; i<nums.length; i+=2) {
            temp-=nums[i];
        }
    }//else, we have two different operations
    else {
        if(addition_indices.length===1 && subtraction_indices.length===1) { //eg 5+5-2
            if(nums[1]==="+") { //nums[1] is the first operation
                temp=nums[0] + nums[2]; //so 0 and 2 indices are the numbers
                temp-=nums[4]; // in index 4 we have the last number  
            }
            else {
                temp=nums[0] - nums[2];
                temp+=nums[4];
            }
        }//same logic as above, but here we check if we have a multiply and a division
        else if(multiply_indices.length===1 && division_indices.length===1) {
            temp = nums[0];
            if(nums[2]===0 || nums[4]===0) {
                division_by_zero = true;
                return null;
            }
            if(nums[1]==="x") {
                temp *= nums[2];
                temp /= nums[4];
            }
            else {
                temp /= nums[2];
                temp *= nums[4];
            }
        }
        else if(division_indices.length===1){
            //else if we have one division then the other operation will be 
            //an addition or subtraction and we have to the division first
            //division_indices[0] is the index of the division
            //and it's length will be 1 since we don't have other divisions
            //so 5/2 5 is the division's index-1 and 2 is +1
            if(nums[division_indices[0]+1]===0) {
                division_by_zero = true;
                return null;
            }
            temp = nums[division_indices[0]-1] / nums[division_indices[0]+1];
            if(addition_indices.length==1) { 
                //do the addition, check where the addition is,on the left or right side
                //of opeation (eg 5/2+3 or 5/3+2)
                if(addition_indices[0]===1) { //if the index is 1 (eg 5+2/3)
                    temp+=nums[addition_indices[0]-1];
                }
                else {
                    temp+=nums[addition_indices[0]+1]
                }
            }
            else { //same as above
                if(subtraction_indices[0]===1) {
                    temp=nums[subtraction_indices[0]-1]-temp;
                }
                else {
                    temp-=nums[subtraction_indices[0]+1];
                }
            }
        }
        else { //same logic as above
            temp = nums[multiply_indices[0]-1] * nums[multiply_indices[0]+1];
            if(addition_indices.length===1) {
                if(addition_indices[0]===1) {
                    temp+=nums[addition_indices[0]-1];
                }
                else {
                    temp+=nums[addition_indices[0]+1]
                }
            }
            else {
                if(subtraction_indices[0]===1) {
                    temp=nums[subtraction_indices[0]-1]-temp;
                }
                else {
                    temp-=nums[subtraction_indices[0]+1];
                }
            }
        }
    }
    return temp;
}