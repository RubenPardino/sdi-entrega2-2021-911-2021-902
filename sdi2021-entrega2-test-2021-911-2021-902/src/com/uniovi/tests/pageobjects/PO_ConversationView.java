package com.uniovi.tests.pageobjects;


import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_ConversationView extends PO_NavView {	
	
	static public void fillForm(WebDriver driver, String comentariop) {
		WebElement email = driver.findElement(By.name("texto"));
		email.click();
		email.clear();
		email.sendKeys(comentariop);
		//Pulsar el boton de Alta.
		By boton = By.className("btn");
		driver.findElement(boton).click();	
	}
	
}
