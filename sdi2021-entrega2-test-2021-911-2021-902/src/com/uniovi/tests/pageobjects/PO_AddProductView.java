package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_AddProductView extends PO_NavView {
	static public void fillForm(WebDriver driver, String titlep, String descriptionp, String pricep) {
		WebElement email = driver.findElement(By.name("titulo"));
		email.click();
		email.clear();
		email.sendKeys(titlep);
		WebElement name = driver.findElement(By.name("detalles"));
		name.click();
		name.clear();
		name.sendKeys(descriptionp);
		WebElement lastname = driver.findElement(By.name("precio"));
		lastname.click();
		lastname.clear();
		lastname.sendKeys(pricep);
	
		By boton = By.className("btn");
		driver.findElement(boton).click();
	}
	
	/*
	static public void fillFormDestacado(WebDriver driver, String titlep, String descriptionp, String pricep) {
		WebElement email = driver.findElement(By.name("title"));
		email.click();
		email.clear();
		email.sendKeys(titlep);
		WebElement name = driver.findElement(By.name("description"));
		name.click();
		name.clear();
		name.sendKeys(descriptionp);
		WebElement lastname = driver.findElement(By.name("money"));
		lastname.click();
		lastname.clear();
		lastname.sendKeys(pricep);
		
		WebElement destacado = driver.findElement(By.name("destacado"));
		destacado.click();
		
		By boton = By.className("btn");
		driver.findElement(boton).click();
	}
	*/


}
